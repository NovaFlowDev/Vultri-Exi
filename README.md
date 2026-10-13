 <div align="center"> <img src="assets/banner.svg" alt="Vultri-Exi" width="100%">

Catch the bugs that cost millions — before you deploy.

License: MIT Solidity TypeScript Show Image PRs Welcome

Demo · Quick Start · Detection Rules · Roadmap · Contribute

</div>
🔍 What Is Vultri-Exi?

An open-source pre-audit scanner for Solidity contracts. Run it before paying for a manual audit, catch the obvious bugs early, and hand auditors a cleaner codebase.

📄 Solidity source
🧱 Layer 1Static heuristics
🧠 Layer 2LLM reasoning
📊 Report + fixes
🧱 Layer 1 — Static heuristics	🧠 Layer 2 — LLM reasoning
Fast, deterministic pattern matching	Explains why a finding is dangerous
Runs in milliseconds	Suggests defensive fixes
Works fully offline	Optional — needs an API key
💡 Why It Exists

Smart contract bugs are catastrophic and irreversible. Manual audits cost $10k–$100k+ and take weeks. Vultri-Exi is a free, instant first pass.

<img src="assets/hack-losses.svg" alt="Major smart contract incidents by loss" width="100%">
✨ Features
Feature	Status	Version
🔁 Reentrancy detection	✅	v0.1
📞 Unchecked external call detection	✅	v0.1
🔑 Missing access control detection	✅	v0.1
👻 Zero-address validation	✅	v0.1
🤖 LLM explanations & fix suggestions	✅	v0.1
📊 Risk dashboard with severity scoring	✅	v0.1
🔗 Slither integration	🚧	v0.2
🧠 Multi-agent adjudication	🔮	v0.3
📦 Foundry PoC generation	🔮	v0.3
⚙️ GitHub Action (CI/CD)	🔮	v0.4
🌐 Multi-chain bytecode scanning	🔮	v0.4
⚙️ How It Works
1 · PASTEDrop Solidity into the textbox
2 · PARSEAST: functions, state vars,calls, modifiers
3 · STATIC ANALYSIS
Reentrancy
Unchecked calls
Access control
Zero-address
4 · LLM EXPLANATIONWhy it's bad + how to fix it
5 · DASHBOARDRisk score · severity ·patches
🎬 Demo

Input — VulnerableVault.sol

solidity
// SPDX-License-Identifier: MIT
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

Output

<img src="assets/scan-report.svg" alt="Scan report for VulnerableVault: 5 findings, risk score 9.1/10" width="100%">

LLM explanation (excerpt)

Finding #1 — Reentrancy (Critical)

The external call to msg.sender runs before balances[msg.sender] is zeroed. An attacker contract can re-enter withdraw() from its receive() function and drain the vault.

Fix: apply Checks-Effects-Interactions.

solidity
balances[msg.sender] = 0;                      // ✅ effects first
(bool ok, ) = msg.sender.call{value: amount}("");
require(ok, "transfer failed");                // ✅ check result
🚀 Quick Start

Prerequisites: Node.js ≥ 18, and optionally an OpenRouter or OpenAI key for AI explanations.

bash
git clone https://github.com/NovaFlowDev/Vultri-Exi.git
cd Vultri-Exi
npm install
cp .env.example .env   # add your API key
npm run dev

Open http://localhost:3000, paste a contract, and hit Run scan.

Environment variables
env
# LLM provider (pick ONE)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
# OPENAI_API_KEY=sk-your-key-here

# Optional
LLM_MODEL=openai/gpt-4o-mini
MAX_FILE_SIZE_KB=512
ENABLE_STATIC_ONLY=false

Without an API key, static analysis still runs; the report shows LLM: skipped_no_key and omits AI explanations.

🏗️ Architecture
ui/Next.js dashboard
scanner/orchestrator
analyzer/reentrancy · uncheckedCallaccessControl · zeroAddress
llm/client · prompts · schemas
OpenRouter / OpenAI
src/
├── analyzer/    # static detectors
├── llm/         # LLM client, prompts, structured-output schemas
├── scanner/     # orchestrator
├── ui/          # dashboard
└── types.ts
tests/
└── fixtures/    # known-vulnerable contracts (easy / medium / hard)

Stack: @solidity-parser/parser · TypeScript · Next.js + Tailwind · Vitest + Foundry

🧠 Detection Rules
<details open> <summary><b>🔁 Reentrancy</b> — Critical · <a href="https://swcregistry.io/docs/SWC-107">SWC-107</a></summary>

Flags external calls that occur before state updates.

solidity
// ❌ Vulnerable
(bool ok, ) = target.call{value: amt}("");
balances[msg.sender] = 0;

// ✅ Fixed
balances[msg.sender] = 0;
(bool ok, ) = target.call{value: amt}("");
require(ok, "transfer failed");
</details> <details> <summary><b>📞 Unchecked External Call</b> — High / Medium · <a href="https://swcregistry.io/docs/SWC-104">SWC-104</a></summary>

Flags low-level calls whose return value is ignored.

solidity
// ❌ Vulnerable
(bool ok, ) = target.call(data);

// ✅ Fixed
(bool ok, ) = target.call(data);
require(ok, "call failed");
</details> <details> <summary><b>🔑 Missing Access Control</b> — Critical / High · <a href="https://swcregistry.io/docs/SWC-105">SWC-105</a></summary>

Flags privileged functions (setOwner, upgradeTo, mint, withdraw) with no onlyOwner / onlyRole modifier.

solidity
// ❌ Vulnerable
function setOwner(address newOwner) public { owner = newOwner; }

// ✅ Fixed
function setOwner(address newOwner) external onlyOwner { owner = newOwner; }
</details> <details> <summary><b>👻 Zero-Address</b> — Low / Medium · <a href="https://swcregistry.io/docs/SWC-113">SWC-113</a></summary>

Flags assignments to privileged state variables without a zero-address check.

solidity
// ❌ Vulnerable
owner = newOwner;

// ✅ Fixed
require(newOwner != address(0), "zero address");
owner = newOwner;
</details>
🗺️ Roadmap
v0.1 ✅
MVP
4 detectors
LLM layer
Dashboard
v0.2 🚧
Depth
Slither integration
20+ rules
SARIF export
v0.3 🔮
Intelligence
Multi-agentadjudication
Foundry PoCs
FP suppression
v0.4 🔮
Scale
GitHub Action
Multi-chain
API + VS Codeextension
v1.0 🌅
Production
Audit-firm workflow
Enterprise tier
Vultri-Exi roadmap
<details> <summary><b>v0.2 — Depth (in progress)</b></summary>
 Integrate Slither detectors
 20+ detection rules (tx.origin, delegatecall, oracle manipulation)
 Structured LLM outputs (JSON schema)
 SARIF / JSON export
 Benchmarks on the DAppSCAN dataset
</details> <details> <summary><b>v0.3 / v0.4 — planned</b></summary>
 Multi-agent adjudication (Debator + Skeptic + Judge)
 Auto-generated Foundry PoCs
 Reachability-based false-positive suppression
 Cross-function dataflow analysis
 GitHub Action, multi-chain scanning, team dashboards, API, VS Code extension
</details>
🤝 Contributing
Fork the repo and create a branch: git checkout -b feat/my-new-detector
Add a known-vulnerable fixture in tests/fixtures/ and a passing test
Commit using Conventional Commits: feat: add tx.origin detector
Open a Pull Request

Good first issues: tx.origin detector · cross-function reentrancy · Parity Wallet fixture · SARIF export · CLI wrapper (vultri-exi scan ./contracts/)

Code style: strict TypeScript, Prettier + ESLint via pre-commit hooks.

Bug reports: include the contract, expected vs. actual output, and your environment (OS, Node version, LLM model).

📜 License

MIT — free to use, modify, and distribute, including commercially.

⚠️ Disclaimer

Vultri-Exi is a helper, not a replacement for a professional audit.

It catches common patterns, not every vulnerability.
LLM explanations can be wrong — always verify.
Never deploy to mainnet without a manual audit from a reputable firm.
Never paste private keys or seed phrases into any scanner.

The authors are not responsible for any losses incurred from using this tool.

<div align="center">

⭐ If Vultri-Exi helped you catch a bug, star the repo.

⬆ Back to top

</div>
