"use client";

import { useMemo, useState } from "react";

const SAMPLE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        (bool ok, ) = msg.sender.call{value: amount}("");
        balances[msg.sender] = 0;
    }

    function setOwner(address newOwner) public {
        owner = newOwner;
    }
}
`;

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

interface EnrichedVulnerability {
  title: string;
  severity: Severity;
  line: number;
  description: string;
  suggested_fix: string;
}

interface ScanResult {
  overall_score: number;
  summary: string;
  vulnerabilities: EnrichedVulnerability[];
  llm_status?: string;
  error?: string;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/40",
  HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  MEDIUM: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  LOW: "bg-sky-500/20 text-sky-200 border-sky-500/40",
  INFO: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};

export default function HomePage() {
  const [sourceCode, setSourceCode] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const v of result?.vulnerabilities ?? []) {
      c[v.severity] = (c[v.severity] ?? 0) + 1;
    }
    return c;
  }, [result]);

  async function onScan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode }),
      });
      const data = (await res.json()) as ScanResult;
      if (!res.ok) {
        setError(data.error ?? "Scan failed");
        setResult(null);
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Vult-Exi MVP</p>
        <h1 className="text-3xl font-semibold tracking-tight">AI-Powered Smart Contract Security Scanner</h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Paste Solidity source. Static heuristics flag reentrancy, unchecked calls, access control, and zero-address issues.
          An LLM then explains findings and suggests defensive fixes.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <label htmlFor="source" className="text-sm font-medium text-slate-300">
            Solidity source
          </label>
          <textarea
            id="source"
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            spellCheck={false}
            className="h-[420px] resize-y rounded-xl border border-slate-800 bg-slate-900/80 p-4 font-mono text-xs leading-5 text-slate-200 outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={onScan}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Scanning…" : "Run scan"}
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-lg font-medium">Risk dashboard</h2>
          {!result ? (
            <p className="text-sm text-slate-500">Results appear here after a scan.</p>
          ) : (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Overall score</p>
                  <p className="text-4xl font-semibold text-cyan-300">{result.overall_score}</p>
                </div>
                <p className="text-xs text-slate-500">LLM: {result.llm_status ?? "n/a"}</p>
              </div>
              <p className="text-sm text-slate-300">{result.summary}</p>
              <div className="flex flex-wrap gap-2">
                {(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as Severity[]).map((s) => (
                  <span key={s} className={`rounded-full border px-2.5 py-1 text-xs ${SEVERITY_STYLES[s]}`}>
                    {s}: {counts[s] ?? 0}
                  </span>
                ))}
              </div>
              <ul className="space-y-3">
                {result.vulnerabilities.map((v, i) => (
                  <li key={`${v.title}-${v.line}-${i}`} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-medium">{v.title}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${SEVERITY_STYLES[v.severity]}`}>
                        {v.severity} · L{v.line}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{v.description}</p>
                    <pre className="mt-2 overflow-x-auto rounded-md bg-slate-900 p-2 text-[11px] text-emerald-300">
                      {v.suggested_fix}
                    </pre>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
