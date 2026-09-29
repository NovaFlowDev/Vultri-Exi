# Vult-Exi — AI Solidity Security Scanner (MVP)

Static heuristics on Solidity source (reentrancy, unchecked calls, access control, zero-address), then optional LLM enrichment for explanations and defensive fix snippets.

## Run

```bash
npm install
cp .env.example .env.local
# set OPENROUTER_API_KEY or OPENAI_API_KEY
npm run dev
```

POST `/api/scan` with `{ "sourceCode": "..." }`.

Without an API key, the API still returns static findings (`llm_status: skipped_no_key`).
