import { NextResponse } from "next/server";
import { scanSolidityCode } from "@/lib/analyzer";
import { enrichFindings } from "@/lib/aiEnricher";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SOURCE_CHARS = 200_000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sourceCode = (body as { sourceCode?: unknown }).sourceCode;
  if (typeof sourceCode !== "string" || sourceCode.trim().length === 0) {
    return NextResponse.json({ error: "sourceCode must be a non-empty string" }, { status: 400 });
  }

  if (sourceCode.length > MAX_SOURCE_CHARS) {
    return NextResponse.json({ error: "sourceCode exceeds size limit" }, { status: 413 });
  }

  try {
    const scan = scanSolidityCode(sourceCode);
    const result = await enrichFindings(scan);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
