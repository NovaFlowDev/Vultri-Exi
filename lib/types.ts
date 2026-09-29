export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type VulnerabilityKind =
  | "reentrancy"
  | "unchecked_external_call"
  | "access_control"
  | "missing_zero_address_check";

/** Static-analysis finding produced before LLM enrichment. */
export interface StaticFinding {
  id: string;
  kind: VulnerabilityKind;
  title: string;
  severity: Severity;
  swcId?: string;
  line: number;
  functionName: string;
  codeSnippet: string;
  description: string;
  suggestedFixHint: string;
}

export interface ParsedParam {
  type: string;
  name: string;
}

/** Lightweight function IR used as an AST baseline (not a full Solidity AST). */
export interface FunctionIR {
  name: string;
  kind: "function" | "constructor" | "fallback" | "receive";
  params: ParsedParam[];
  modifiers: string[];
  visibility: "public" | "external" | "internal" | "private" | "default";
  mutability: "payable" | "view" | "pure" | "nonpayable";
  body: string;
  bodyStart: number;
  startLine: number;
  endLine: number;
}

export interface ScanContext {
  rawSource: string;
  strippedSource: string;
  functions: FunctionIR[];
  findings: StaticFinding[];
}

export interface EnrichedVulnerability {
  title: string;
  severity: Severity;
  line: number;
  description: string;
  suggested_fix: string;
}

export interface EnrichedScanResult {
  overall_score: number;
  summary: string;
  vulnerabilities: EnrichedVulnerability[];
  static_findings?: StaticFinding[];
  llm_status: "ok" | "skipped_no_key" | "timeout" | "parse_error" | "rate_limited" | "error";
}
