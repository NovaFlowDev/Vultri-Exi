import OpenAI from "openai";
import type {
  EnrichedScanResult,
  EnrichedVulnerability,
  ScanContext,
  Severity,
} from "./types";

const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

function scoreFromFindings(countBy: Record<string, number>): number {
  const penalty =
    (countBy.CRITICAL ?? 0) * 25 +
    (countBy.HIGH ?? 0) * 15 +
    (countBy.MEDIUM ?? 0) * 8 +
    (countBy.LOW ?? 0) * 3;
  return Math.max(0, Math.min(100, 100 - penalty));
}

function heuristicEnrichment(scan: ScanContext, llmStatus: EnrichedScanResult["llm_status"], note?: string): EnrichedScanResult {
  const countBy: Record<string, number> = {};
  for (const f of scan.findings) {
    countBy[f.severity] = (countBy[f.severity] ?? 0) + 1;
  }
  const overall_score = scoreFromFindings(countBy);
  const summary =
    scan.findings.length === 0
      ? "No heuristic issues matched. This is not a formal audit — keep using tests, reviews, and specialized tools."
      : `Static analysis found ${scan.findings.length} issue(s). ${note ?? "LLM enrichment was not applied."}`;

  return {
    overall_score,
    summary,
    vulnerabilities: scan.findings.map((f) => ({
      title: f.title,
      severity: f.severity,
      line: f.line,
      description: f.description,
      suggested_fix: f.suggestedFixHint,
    })),
    static_findings: scan.findings,
    llm_status: llmStatus,
  };
}

function getClient(): OpenAI | null {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const apiKey = openRouterKey || openAiKey;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: openRouterKey ? "https://openrouter.ai/api/v1" : undefined,
    timeout: Number(process.env.LLM_TIMEOUT_MS ?? 60_000),
    defaultHeaders: openRouterKey
      ? {
          "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
          "X-Title": "Vult-Exi Solidity Scanner",
        }
      : undefined,
  });
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("No JSON object in model output");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function asSeverity(value: unknown): Severity {
  const upper = String(value ?? "MEDIUM").toUpperCase();
  return SEVERITIES.includes(upper as Severity) ? (upper as Severity) : "MEDIUM";
}

function normalizeEnriched(parsed: unknown, scan: ScanContext): EnrichedScanResult {
  const obj = parsed as Record<string, unknown>;
  const rawVulns = Array.isArray(obj.vulnerabilities) ? obj.vulnerabilities : [];
  const vulnerabilities: EnrichedVulnerability[] = rawVulns.map((item, index) => {
    const v = (item ?? {}) as Record<string, unknown>;
    const fallback = scan.findings[index];
    return {
      title: String(v.title ?? fallback?.title ?? "Finding"),
      severity: asSeverity(v.severity ?? fallback?.severity),
      line: Number(v.line ?? fallback?.line ?? 0) || 0,
      description: String(v.description ?? fallback?.description ?? ""),
      suggested_fix: String(v.suggested_fix ?? fallback?.suggestedFixHint ?? ""),
    };
  });

  const overall_score = Number(obj.overall_score);
  return {
    overall_score: Number.isFinite(overall_score) ? Math.max(0, Math.min(100, overall_score)) : scoreFromFindings({}),
    summary: String(obj.summary ?? "Scan completed."),
    vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : heuristicEnrichment(scan, "ok").vulnerabilities,
    static_findings: scan.findings,
    llm_status: "ok",
  };
}

function buildPrompt(scan: ScanContext): string {
  const compact = scan.findings.map((f) => ({
    title: f.title,
    severity: f.severity,
    swcId: f.swcId,
    line: f.line,
    functionName: f.functionName,
    codeSnippet: f.codeSnippet,
    description: f.description,
    suggestedFixHint: f.suggestedFixHint,
  }));

  return [
    "You are a senior smart-contract security reviewer helping developers remediate issues.",
    "Use the static-analysis findings below. Do not invent extra vulns unless clearly implied by a snippet.",
    "Do NOT provide exploit payloads, attack scripts, or step-by-step abuse instructions.",
    "Explain the risk at a high level and provide defensive Solidity (Checks-Effects-Interactions, access modifiers, zero-address checks).",
    "Return STRICT JSON only, matching this schema:",
    JSON.stringify(
      {
        overall_score: 85,
        summary: "Short executive summary of security health",
        vulnerabilities: [
          {
            title: "Reentrancy Risk",
            severity: "HIGH",
            line: 14,
            description: "Explanation of the issue and why it matters",
            suggested_fix: "Remediated Solidity snippet using Checks-Effects-Interactions",
          },
        ],
      },
      null,
      2,
    ),
    "severity must be one of: CRITICAL, HIGH, MEDIUM, LOW, INFO.",
    "overall_score is 0-100 (higher is healthier).",
    "Findings:",
    JSON.stringify(compact, null, 2),
  ].join("\n");
}

/**
 * Enrich static findings with an LLM. Degrades to heuristic text if the API
 * key is missing or the provider fails — never throws to the route handler.
 */
export async function enrichFindings(scan: ScanContext): Promise<EnrichedScanResult> {
  if (scan.findings.length === 0) {
    return heuristicEnrichment(scan, "ok", "No static findings to enrich.");
  }

  const client = getClient();
  if (!client) {
    return heuristicEnrichment(scan, "skipped_no_key", "Set OPENROUTER_API_KEY or OPENAI_API_KEY for AI explanations.");
  }

  const model =
    process.env.LLM_MODEL ??
    (process.env.OPENROUTER_API_KEY ? "openai/gpt-4o" : "gpt-4o");

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You output only valid JSON objects. You are a defensive smart-contract reviewer.",
        },
        { role: "user", content: buildPrompt(scan) },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "";
    return normalizeEnriched(extractJsonObject(text), scan);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (/timeout/i.test(message)) {
      return heuristicEnrichment(scan, "timeout", "LLM request timed out.");
    }
    if (/429|rate limit/i.test(message)) {
      return heuristicEnrichment(scan, "rate_limited", "LLM rate limit exceeded.");
    }
    if (/JSON|parse/i.test(message)) {
      return heuristicEnrichment(scan, "parse_error", "LLM response was not valid JSON.");
    }
    return heuristicEnrichment(scan, "error", "LLM enrichment failed; showing static findings only.");
  }
}
