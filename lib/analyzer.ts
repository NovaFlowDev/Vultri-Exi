import type {
  FunctionIR,
  ParsedParam,
  ScanContext,
  StaticFinding,
  VulnerabilityKind,
} from "./types";

const ACCESS_GUARD_RE =
  /\b(onlyOwner|onlyRole|onlyAdmin|onlyGovernance|auth|restricted|whenNotPaused|nonReentrant)\b/;

const SENSITIVE_NAME_RE =
  /\b(withdraw|transferOwnership|setOwner|mint|burn|pause|unpause|destroy|selfdestruct|upgrade|setAdmin|drain)\b/i;

const EXTERNAL_CALL_RE =
  /\.(?:call|delegatecall|staticcall|transfer|send)\s*(?:\{[\s\S]*?\})?\s*\(/g;

const UNCHECKED_CALL_RE =
  /\.(?:call|delegatecall|staticcall|send)\s*(?:\{[\s\S]*?\})?\s*\(/g;

/**
 * Heuristic storage writes: mapping/index assignments, increment, delete.
 * Local declarations (`uint x = …`) are filtered out later.
 */
const STATE_WRITE_RE =
  /(?:\bdelete\s+[A-Za-z_][\w.]*(?:\[[^\]]+\])*|\b[A-Za-z_][\w.]*(?:\[[^\]]+\])*\s*(?:\+\+|--|\+=|-=|\*=|\/=|%=|=(?!=)))/g;

const LOCAL_DECL_RE =
  /^(?:(?:mapping\s*\(|uint\d*|int\d*|bool|address|bytes\d*|string|memory|storage|calldata)\b)/;

/**
 * Strip Solidity comments while preserving newlines so original line numbers
 * remain aligned with the stripped buffer.
 */
export function stripComments(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") {
        out += " ";
        i += 1;
      }
      continue;
    }

    if (ch === "/" && next === "*") {
      out += "  ";
      i += 2;
      while (i < source.length) {
        if (source[i] === "\n") {
          out += "\n";
          i += 1;
          continue;
        }
        if (source[i] === "*" && source[i + 1] === "/") {
          out += "  ";
          i += 2;
          break;
        }
        out += " ";
        i += 1;
      }
      continue;
    }

    out += ch;
    i += 1;
  }
  return out;
}

function lineOfIndex(source: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < source.length; i += 1) {
    if (source[i] === "\n") line += 1;
  }
  return line;
}

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseParams(raw: string): ParsedParam[] {
  const inner = raw.trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const bits = part.replace(/\b(memory|calldata|storage|indexed)\b/g, "").trim().split(/\s+/);
      const name = bits.length > 1 ? bits[bits.length - 1] : "";
      const type = bits.length > 1 ? bits.slice(0, -1).join(" ") : bits[0] ?? "";
      return { type, name };
    });
}

function parseVisibility(sig: string): FunctionIR["visibility"] {
  if (/\bexternal\b/.test(sig)) return "external";
  if (/\bpublic\b/.test(sig)) return "public";
  if (/\binternal\b/.test(sig)) return "internal";
  if (/\bprivate\b/.test(sig)) return "private";
  return "default";
}

function parseMutability(sig: string): FunctionIR["mutability"] {
  if (/\bpure\b/.test(sig)) return "pure";
  if (/\bview\b/.test(sig)) return "view";
  if (/\bpayable\b/.test(sig)) return "payable";
  return "nonpayable";
}

/**
 * Extract functions/constructor/fallback/receive into a small IR.
 * This is an AST *baseline*: brace-matched bodies + signature tokens,
 * not a full Solidity grammar.
 */
export function extractFunctions(stripped: string): FunctionIR[] {
  const functions: FunctionIR[] = [];
  const keywordRe = /\b(function|constructor|fallback|receive)\b/g;
  let match: RegExpExecArray | null;

  while ((match = keywordRe.exec(stripped)) !== null) {
    const kind = match[1] as FunctionIR["kind"];
    const sigStart = match.index;
    const braceStart = stripped.indexOf("{", sigStart);
    if (braceStart < 0) continue;

    const braceEnd = findMatchingBrace(stripped, braceStart);
    if (braceEnd < 0) continue;

    const signature = stripped.slice(sigStart, braceStart);
    const body = stripped.slice(braceStart + 1, braceEnd);

    let name = kind;
    let paramsRaw = "";
    if (kind === "function") {
      const fnMatch = signature.match(/\bfunction\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/);
      if (!fnMatch) continue;
      name = fnMatch[1];
      paramsRaw = fnMatch[2];
    } else if (kind === "constructor") {
      const ctorMatch = signature.match(/\bconstructor\s*\(([^)]*)\)/);
      paramsRaw = ctorMatch?.[1] ?? "";
      name = "constructor";
    }

    const modifierTokens =
      signature
        .replace(/^[\s\S]*?\)/, "")
        .match(/\b[A-Za-z_]\w*(?:\s*\([^)]*\))?/g)
        ?.map((t) => t.trim()) ?? [];

    functions.push({
      name,
      kind,
      params: parseParams(paramsRaw),
      modifiers: modifierTokens,
      visibility: parseVisibility(signature),
      mutability: parseMutability(signature),
      body,
      bodyStart: braceStart + 1,
      startLine: lineOfIndex(stripped, sigStart),
      endLine: lineOfIndex(stripped, braceEnd),
    });

    keywordRe.lastIndex = braceEnd + 1;
  }

  return functions;
}

function snippetAround(source: string, index: number, radius = 80): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(source.length, index + radius);
  return source.slice(start, end).replace(/\s+/g, " ").trim();
}

function firstMatchIndex(body: string, re: RegExp): number {
  const copy = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  const m = copy.exec(body);
  return m ? m.index : -1;
}

function isLikelyStateWrite(token: string): boolean {
  const left = token.replace(/\s+/g, " ").trim();
  if (LOCAL_DECL_RE.test(left)) return false;
  if (/^(require|assert|revert|emit|return|if|for|while)\b/.test(left)) return false;
  return true;
}

function collectStateWriteIndexes(body: string): number[] {
  const indexes: number[] = [];
  const re = new RegExp(STATE_WRITE_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (isLikelyStateWrite(m[0])) indexes.push(m.index);
  }
  return indexes;
}

function hasAccessGuard(fn: FunctionIR): boolean {
  const joined = fn.modifiers.join(" ");
  return ACCESS_GUARD_RE.test(joined);
}

function finding(
  kind: VulnerabilityKind,
  partial: Omit<StaticFinding, "id" | "kind">,
): StaticFinding {
  return {
    id: `${kind}:${partial.functionName}:${partial.line}`,
    kind,
    ...partial,
  };
}

function detectReentrancy(fn: FunctionIR, stripped: string): StaticFinding[] {
  const callIndex = firstMatchIndex(fn.body, EXTERNAL_CALL_RE);
  if (callIndex < 0) return [];

  const writes = collectStateWriteIndexes(fn.body);
  const writeAfterCall = writes.find((w) => w > callIndex);
  if (writeAfterCall === undefined) return [];

  if (fn.modifiers.some((m) => /\bnonReentrant\b/.test(m))) return [];

  const absIndex = fn.bodyStart + callIndex;
  return [
    finding("reentrancy", {
      title: "Reentrancy Risk",
      severity: "CRITICAL",
      swcId: "SWC-107",
      line: lineOfIndex(stripped, absIndex),
      functionName: fn.name,
      codeSnippet: snippetAround(fn.body, callIndex),
      description:
        "An external call appears before a storage update. If the callee re-enters this function, balances or flags may still reflect the pre-call state.",
      suggestedFixHint:
        "Apply Checks-Effects-Interactions: update storage first, then interact. Prefer a reentrancy guard (e.g. OpenZeppelin nonReentrant).",
    }),
  ];
}

function detectUncheckedCalls(fn: FunctionIR, stripped: string): StaticFinding[] {
  const findings: StaticFinding[] = [];
  const re = new RegExp(UNCHECKED_CALL_RE.source, "g");
  let m: RegExpExecArray | null;
  const seen = new Set<number>();

  while ((m = re.exec(fn.body)) !== null) {
    const idx = m.index;
    const windowStart = Math.max(0, idx - 40);
    const prefix = fn.body.slice(windowStart, idx);
    const after = fn.body.slice(idx, Math.min(fn.body.length, idx + 180));

    const wrappedInRequire = /require\s*\(\s*$/.test(prefix.replace(/\s+/g, " "));
    const assigned = /(?:=\s*)$/.test(prefix.replace(/\s+/g, " ")) || /\bbool\s+\w+\s*=/.test(prefix);
    const successChecked = /\bsuccess\b/.test(after) && /\brequire\s*\(/.test(fn.body);

    if (wrappedInRequire || (assigned && successChecked)) continue;
    if (assigned && /require\s*\(\s*\w+/.test(after)) continue;

    const line = lineOfIndex(stripped, fn.bodyStart + idx);
    if (seen.has(line)) continue;
    seen.add(line);

    findings.push(
      finding("unchecked_external_call", {
        title: "Unchecked External Call",
        severity: "HIGH",
        swcId: "SWC-104",
        line,
        functionName: fn.name,
        codeSnippet: snippetAround(fn.body, idx),
        description:
          "A low-level call return value is not checked. Failed transfers or callee reverts can be ignored, leaving accounting inconsistent.",
        suggestedFixHint:
          "Capture `(bool success, ) = target.call(...)` and `require(success, ...)` or use a safer high-level transfer helper.",
      }),
    );
  }

  return findings;
}

function detectAccessControl(fn: FunctionIR, stripped: string): StaticFinding[] {
  if (fn.kind !== "function") return [];
  if (fn.mutability === "view" || fn.mutability === "pure") return [];
  if (fn.visibility !== "public" && fn.visibility !== "external" && fn.visibility !== "default") {
    return [];
  }
  if (hasAccessGuard(fn)) return [];

  const sensitiveName = SENSITIVE_NAME_RE.test(fn.name);
  const ownerWrite = /\b(owner|admin|minter|guardian)\b\s*=/.test(fn.body);
  const userSelfWithdraw = /\bbalances\s*\[\s*msg\.sender\s*\]/.test(fn.body);
  const looksSensitive =
    (sensitiveName && !userSelfWithdraw) || ownerWrite || /\bselfdestruct\b/.test(fn.body);

  if (!looksSensitive) return [];

  return [
    finding("access_control", {
      title: "Missing Access Control",
      severity: "HIGH",
      swcId: "SWC-105",
      line: fn.startLine,
      functionName: fn.name,
      codeSnippet: `function ${fn.name}(${fn.params.map((p) => `${p.type} ${p.name}`.trim()).join(", ")}) ${fn.modifiers.join(" ")}`.trim(),
      description:
        "A state-changing function that looks privileged (owner/mint/withdraw/upgrade or external value transfer) has no modifier such as onlyOwner or onlyRole.",
      suggestedFixHint:
        "Restrict the function with Ownable/AccessControl modifiers, or make it internal and expose a guarded wrapper.",
    }),
  ];
}

function detectZeroAddress(fn: FunctionIR, stripped: string): StaticFinding[] {
  const addressParams = fn.params.filter((p) => /\baddress\b/.test(p.type) && p.name);
  if (addressParams.length === 0) return [];

  const isSetter = fn.kind === "constructor" || /^set[A-Z_]/.test(fn.name) || /owner|admin|token|recipient/i.test(fn.name);
  if (!isSetter) return [];

  const body = fn.body;
  const findings: StaticFinding[] = [];

  for (const param of addressParams) {
    const name = param.name;
    const checked =
      new RegExp(`\\b${name}\\b[\\s\\S]{0,80}address\\s*\\(\\s*0\\s*\\)`).test(body) ||
      new RegExp(`address\\s*\\(\\s*0\\s*\\)[\\s\\S]{0,80}\\b${name}\\b`).test(body) ||
      new RegExp(`\\brequire\\s*\\(\\s*${name}\\s*!=`).test(body);

    if (checked) continue;

    findings.push(
      finding("missing_zero_address_check", {
        title: "Missing Zero-Address Check",
        severity: "MEDIUM",
        swcId: "SWC-115",
        line: fn.startLine,
        functionName: fn.name,
        codeSnippet:
          fn.kind === "constructor"
            ? `constructor(... ${param.type} ${name} ...)`
            : `function ${fn.name}(... ${param.type} ${name} ...)`,
        description: `Parameter \`${name}\` is an address used in a constructor or setter without rejecting address(0).`,
        suggestedFixHint: `require(${name} != address(0), "zero address"); before storing or using the value.`,
      }),
    );
  }

  return findings;
}

function dedupe(findings: StaticFinding[]): StaticFinding[] {
  const seen = new Set<string>();
  const out: StaticFinding[] = [];
  for (const f of findings) {
    const key = `${f.kind}:${f.functionName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out.sort((a, b) => a.functionName.localeCompare(b.functionName) || (a.swcId ?? "").localeCompare(b.swcId ?? ""));
}

/**
 * Static scan entry point: comment-strip → function IR → heuristic rules.
 */
export function scanSolidityCode(code: string): ScanContext {
  const rawSource = code ?? "";
  const strippedSource = stripComments(rawSource);
  const functions = extractFunctions(strippedSource);

  const findings: StaticFinding[] = [];
  for (const fn of functions) {
    try {
      findings.push(...detectReentrancy(fn, strippedSource));
      findings.push(...detectUncheckedCalls(fn, strippedSource));
      findings.push(...detectAccessControl(fn, strippedSource));
      findings.push(...detectZeroAddress(fn, strippedSource));
    } catch {
      // Continue remaining functions if a single rule throws.
    }
  }

  return {
    rawSource,
    strippedSource,
    functions,
    findings: dedupe(findings),
  };
}
