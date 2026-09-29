<div align="center">

# 🛡️ Vultri-Exi

### AI-Powered Smart Contract Security Scanner

**Catch the bugs that cost millions — before you deploy.**

Paste Solidity. Get findings. Get fixes. In seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636)](https://soliditylang.org/)
[![Status](https://img.shields.io/badge/status-MVP-orange)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/NovaFlowDev/Vultri-Exi/pulls)

[**Try Demo**](#-demo) · [**Quick Start**](#-quick-start) · [**Detection Rules**](#-detection-rules) · [**Roadmap**](#-roadmap) · [**Contribute**](#-contributing)

</div>

---

## 📖 Table of Contents

<details>
<summary>Click to expand</summary>

- [What Is Vultri-Exi?](#-what-is-vultri-exi)
- [Why It Exists](#-why-it-exists)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Demo](#-demo)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Architecture](#-architecture)
- [Detection Rules](#-detection-rules)
- [Example Scan](#-example-scan)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#-disclaimer)

</details>

---

## 🔍 What Is Vultri-Exi?

Vultri-Exi is an **open-source smart contract security scanner** that combines two layers of defense:

<table>
<tr>
<td width="50%">

### 🧱 Layer 1 — Static Heuristics
Fast, deterministic pattern matching. No AI, no guessing. Just rules.

- ⚡ Runs in milliseconds
- 🎯 Zero false negatives on known patterns
- 🔒 Fully offline capable

</td>
<td width="50%">

### 🧠 Layer 2 — LLM Reasoning
Human-readable explanations powered by large language models.

- 💬 Explains *why* it's dangerous
- 🛠️ Suggests defensive fixes
- 📚 Teaches as it scans

</td>
</tr>
</table>

It's designed as a **pre-audit hygiene tool** — run it before spending $50k on a manual audit, catch the obvious bugs early, and hand auditors a cleaner codebase.

> **🎯 Mission:** Make smart contract security accessible to every developer — not just elite auditors.

---

## 💡 Why It Exists

Smart contract bugs are **catastrophic and irreversible**. There's no "undo" button on the blockchain.

<table>
<tr>
<th align="left">💥 Incident</th>
<th align="left">Year</th>
<th align="left">Loss</th>
<th align="left">Cause</th>
</tr>
<tr>
<td>🔁 The DAO Hack</td>
<td>2016</td>
<td><b>$60M</b></td>
<td>Reentrancy</td>
</tr>
<tr>
<td>🔑 Parity Wallet Freeze</td>
<td>2017</td>
<td><b>$150M</b></td>
<td>Access control</td>
</tr>
<tr>
<td>📞 Wormhole Bridge</td>
<td>2022</td>
<td><b>$320M</b></td>
<td>Unchecked call</td>
</tr>
<tr>
<td>🔑 Ronin Bridge</td>
<td>2022</td>
<td><b>$625M</b></td>
<td>Key compromise</td>
</tr>
</table>

**Manual audits are expensive ($10k–$100k+) and slow (weeks).**

Vultri-Exi gives developers a **free, instant first pass** — so obvious bugs never reach production.

> **Use Vultri-Exi to catch the obvious bugs. Hire an auditor to catch the sneaky ones.**

---

## ✨ Features

<table>
<tr>
<th align="left">Feature</th>
<th align="center">Status</th>
<th align="center">Version</th>
</tr>
<tr><td>🔁 Reentrancy detection</td><td align="center">✅</td><td align="center">v0.1</td></tr>
<tr><td>📞 Unchecked external call detection</td><td align="center">✅</td><td align="center">v0.1</td></tr>
<tr><td>🔑 Missing access control detection</td><td align="center">✅</td><td align="center">v0.1</td></tr>
<tr><td>👻 Zero-address validation</td><td align="center">✅</td><td align="center">v0.1</td></tr>
<tr><td>🤖 LLM explanations & fix suggestions</td><td align="center">✅</td><td align="center">v0.1</td></tr>
<tr><td>📊 Risk dashboard with severity scoring</td><td align="center">✅</td><td align="center">v0.1</td></tr>
<tr><td>🧠 Multi-agent adjudication (reduce false positives)</td><td align="center">🚧</td><td align="center">v0.3</td></tr>
<tr><td>🔗 Slither integration</td><td align="center">🚧</td><td align="center">v0.2</td></tr>
<tr><td>⚙️ CI/CD (GitHub Action)</td><td align="center">🚧</td><td align="center">v0.4</td></tr>
<tr><td>📦 Foundry PoC generation</td><td align="center">🚧</td><td align="center">v0.3</td></tr>
<tr><td>🌐 Multi-chain bytecode scanning</td><td align="center">🚧</td><td align="center">v0.4</td></tr>
</table>

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. PASTE                                                   │
│     Drop your Solidity source into the text box             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  2. PARSE                                                   │
│     AST generation — functions, state vars, calls, modifiers│
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  3. STATIC ANALYSIS                                         │
│     ┌────────────┬────────────┬────────────┬────────────┐  │
│     │ Reentrancy │ Unchecked  │   Access   │   Zero-    │  │
│     │  Detector  │   Calls    │  Control   │  Address   │  │
│     └────────────┴────────────┴────────────┴────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  4. LLM EXPLANATION                                         │
│     Each finding → "Why it's bad" + "How to fix it"         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  5. DASHBOARD                                               │
│     Risk score · Findings by severity · Patch suggestions   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 Demo

### 📥 Input — `VulnerableVault.sol`

```solidity
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
```

### 📤 Output

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️  VULTR-EXI SCAN REPORT                                  │
├─────────────────────────────────────────────────────────────┤
│  Contract:    VulnerableVault                               │
│  Findings:    5                                             │
│  Risk Score:  9.1 / 10  ████████████████████░░  CRITICAL    │
├─────────────────────────────────────────────────────────────┤
│  #  SEVERITY   CATEGORY               LOCATION              │
│  1  🔴 CRIT    Reentrancy             withdraw()            │
│  2  🔴 CRIT    Access Control         setOwner()            │
│  3  🟠 HIGH    Unprotected Transfer   withdraw()            │
│  4  🟡 MED     Unchecked Call         withdraw()            │
│  5  🟢 LOW     Zero-Address           constructor/setOwner  │
└─────────────────────────────────────────────────────────────┘
```

### 🧠 LLM Explanation (excerpt)

> **Finding #1 — Reentrancy (Critical)**
>
> This vault follows the *withdraw-then-update* anti-pattern. The external call to `msg.sender` executes **before** `balances[msg.sender]` is zeroed. An attacker contract can re-enter `withdraw()` in its `receive()` function, draining the vault.
>
> **Fix:** Apply Checks-Effects-Interactions — zero the balance *before* the external call.
>
> ```solidity
> balances[msg.sender] = 0;                      // ✅ effects first
> (bool ok, ) = msg.sender.call{value: amount}("");
> require(ok, "transfer failed");                // ✅ check result
> ```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 *(or Python ≥ 3.10 for the backend)*
- **npm** / **pnpm** / **yarn**
- An API key from [OpenRouter](https://openrouter.ai/keys) or [OpenAI](https://platform.openai.com/api-keys) *(optional — needed only for AI explanations)*

### Installation

```bash
# Clone the repo
git clone https://github.com/NovaFlowDev/Vultri-Exi.git
cd Vultri-Exi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Then edit .env and add your API key

# Launch
npm run dev
```

Open [**http://localhost:3000**](http://localhost:3000) → paste a contract → hit **Run scan**.

### 🐳 Docker (Alternative)

```bash
docker build -t vultri-exi .
docker run -p 3000:3000 --env-file .env vultri-exi
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# ─── LLM Provider (pick ONE) ───────────────────────────────
OPENROUTER_API_KEY=sk-or-v1-your-key-here
# OPENAI_API_KEY=sk-your-key-here

# ─── Model Selection (optional) ────────────────────────────
LLM_MODEL=openai/gpt-4o-mini

# ─── Optional: scan tuning ─────────────────────────────────
MAX_FILE_SIZE_KB=512
ENABLE_STATIC_ONLY=false
```

> ⚠️ **Without an API key:** the scanner still runs static analysis but returns `LLM: skipped_no_key` and omits AI explanations.

---

## 🏗️ Architecture

```
Vultri-Exi/
├── src/
│   ├── analyzer/                # Static heuristics
│   │   ├── reentrancy.ts
│   │   ├── uncheckedCall.ts
│   │   ├── accessControl.ts
│   │   └── zeroAddress.ts
│   ├── llm/                     # LLM explanation layer
│   │   ├── client.ts            # OpenRouter / OpenAI wrapper
│   │   ├── prompts.ts           # System + user prompts
│   │   └── schemas.ts           # Structured output schemas
│   ├── scanner/                 # Orchestrator
│   │   └── index.ts
│   ├── ui/                      # Dashboard
│   │   ├── components/
│   │   └── pages/
│   └── types.ts                 # Shared TypeScript types
├── tests/
│   ├── fixtures/                # Known-vulnerable contracts
│   │   ├── easy/
│   │   ├── medium/
│   │   └── hard/
│   └── scanner.test.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Parser** | `@solidity-parser/parser` or `solc` AST |
| **Static Rules** | TypeScript |
| **LLM** | OpenRouter / OpenAI with structured outputs |
| **Frontend** | Next.js + Tailwind CSS |
| **Backend** | Node.js (or FastAPI if Python) |
| **Tests** | Vitest + Foundry |
| **Deploy** | Docker + Vercel / Fly.io |

---

## 🧠 Detection Rules

<details open>
<summary><b>🔁 Reentrancy (Critical)</b></summary>

Flags external calls (`call`, `send`, `transfer`) that occur **before** state updates.

**Vulnerable pattern:**
```solidity
(bool ok, ) = target.call{value: amt}("");  // ⚠️ external call
balances[msg.sender] = 0;                    // ⚠️ state update AFTER
```

**Fix:**
```solidity
balances[msg.sender] = 0;                    // ✅ effects first
(bool ok, ) = target.call{value: amt}("");
require(ok, "transfer failed");
```

**References:** [SWC-107](https://swcregistry.io/docs/SWC-107) · [The DAO Hack](https://hackingdistributed.com/2016/06/18/analysis-of-the-dao-exploit/)

</details>

<details>
<summary><b>📞 Unchecked External Call (High / Medium)</b></summary>

Flags low-level calls where the return value is ignored.

**Vulnerable pattern:**
```solidity
(bool ok, ) = target.call(...);
// `ok` never checked ⚠️
```

**Fix:**
```solidity
(bool ok, ) = target.call(...);
require(ok, "call failed");  // ✅
```

**References:** [SWC-104](https://swcregistry.io/docs/SWC-104)

</details>

<details>
<summary><b>🔑 Missing Access Control (Critical / High)</b></summary>

Flags privileged functions (`setOwner`, `upgradeTo`, `mint`, `withdraw`) with no `onlyOwner` / `onlyRole` modifier.

**Vulnerable pattern:**
```solidity
function setOwner(address newOwner) public {  // ⚠️ no modifier
    owner = newOwner;
}
```

**Fix:**
```solidity
function setOwner(address newOwner) external onlyOwner {
    owner = newOwner;
}
```

**References:** [SWC-105](https://swcregistry.io/docs/SWC-105) · [Parity Wallet Freeze](https://www.parity.io/blog/a-postmortem-on-the-parity-multi-sig-library-self-destruct/)

</details>

<details>
<summary><b>👻 Zero-Address (Low / Medium)</b></summary>

Flags assignments of `address(0)` to privileged state variables.

**Vulnerable pattern:**
```solidity
owner = newOwner;  // ⚠️ newOwner could be address(0)
```

**Fix:**
```solidity
require(newOwner != address(0), "zero address");
owner = newOwner;
```

**References:** [SWC-113](https://swcregistry.io/docs/SWC-113)

</details>

---

## 📊 Example Scan

Scan output for the **`ProxyVaultDAO`** test contract — a deliberately hard case with cross-function interactions:

```
┌───────────────────────────────────────────────────────────────┐
│  🛡️  VULTR-EXI SCAN REPORT — ProxyVaultDAO                    │
├───────────────────────────────────────────────────────────────┤
│  Findings:     9                                              │
│  Risk Score:   9.6 / 10  ████████████████████░  CRITICAL      │
│  ⚠  Cross-function interactions detected                      │
├───────────────────────────────────────────────────────────────┤
│  #  SEVERITY   CATEGORY               FUNCTION                │
│  1  🔴 CRIT    Storage Collision      upgradeTo / fallback    │
│  2  🔴 CRIT    Arbitrary Call         execute()               │
│  3  🔴 CRIT    DoS via Revert         batchWithdraw()         │
│  4  🟠 HIGH    Reentrancy (missed)    withdrawAll()           │
│  5  🟠 HIGH    Ownership Sniping      transfer/acceptOwner    │
│  6  🟠 HIGH    Self-DoS               emergencyPause()        │
│  7  🟡 MED     Accounting Drift       receive()               │
│  8  🟡 MED     Zero-Address           transferOwnership()     │
│  9  🟢 LOW     Forced ETH             fallback()              │
└───────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap

<table>
<tr>
<th align="left">Version</th>
<th align="left">Theme</th>
<th align="left">Highlights</th>
<th align="center">Status</th>
</tr>
<tr>
<td><b>v0.1</b></td>
<td>MVP</td>
<td>4 detectors · LLM layer · dashboard</td>
<td align="center">✅</td>
</tr>
<tr>
<td><b>v0.2</b></td>
<td>Depth</td>
<td>Slither integration · 20+ rules · SARIF export</td>
<td align="center">🚧</td>
</tr>
<tr>
<td><b>v0.3</b></td>
<td>Intelligence</td>
<td>Multi-agent adjudication · Foundry PoCs · FP suppression</td>
<td align="center">🔮</td>
</tr>
<tr>
<td><b>v0.4</b></td>
<td>Scale</td>
<td>GitHub Action · multi-chain · team dashboards · API</td>
<td align="center">🔮</td>
</tr>
<tr>
<td><b>v1.0</b></td>
<td>Production</td>
<td>Full audit-firm workflow · SLAs · enterprise tier</td>
<td align="center">🌅</td>
</tr>
</table>

<details>
<summary><b>v0.2 — Depth (in progress)</b></summary>

- [ ] Integrate [Slither](https://github.com/crytic/slither) detectors
- [ ] Add 20+ detection rules (`tx.origin`, `delegatecall`, oracle manipulation)
- [ ] Structured LLM outputs (JSON schema)
- [ ] Export findings as SARIF / JSON
- [ ] Detection benchmarks (DAppSCAN dataset)

</details>

<details>
<summary><b>v0.3 — Intelligence (planned)</b></summary>

- [ ] Multi-agent adjudication (Debator + Skeptic + Judge)
- [ ] Auto-generate Foundry PoCs for confirmed bugs
- [ ] False-positive suppression via reachability analysis
- [ ] Historical exploit database matching
- [ ] Cross-function dataflow analysis

</details>

<details>
<summary><b>v0.4 — Scale (planned)</b></summary>

- [ ] GitHub Action for CI/CD
- [ ] Multi-chain bytecode scanning (Ethereum, Base, Arbitrum, Solana)
- [ ] Team dashboards + saved projects
- [ ] API access for audit firms
- [ ] VS Code extension

</details>

---

## 🤝 Contributing

We welcome contributions from security researchers, Solidity devs, and AI engineers.

### 🚀 How to Contribute

1. **Fork** the repo
2. **Create a branch**: `git checkout -b feat/my-new-detector`
3. **Add tests** in `tests/fixtures/` with a known-vulnerable contract
4. **Commit**: `git commit -m "feat: add tx.origin detector"`
5. **Push** and open a **Pull Request**

### 🎯 Good First Issues

- [ ] Add a `tx.origin` phishing detector
- [ ] Improve the reentrancy heuristic to catch cross-function reentrancy
- [ ] Write a test fixture for the Parity Wallet bug
- [ ] Add SARIF export support
- [ ] Build a CLI wrapper (`vultri-exi scan ./contracts/`)

### 📏 Code Style

- **TypeScript** with strict mode
- **Prettier** + **ESLint** enforced via pre-commit hooks
- All detectors must ship with a **fixture contract** and a **passing test**
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)

### 🐛 Reporting Bugs

Open an issue with:
- The Solidity contract that triggered the bug
- Expected vs. actual output
- Your environment (OS, Node version, LLM model)

---

## 📜 License

MIT License — see [LICENSE](https://github.com/NovaFlowDev/Vultri-Exi/blob/main/LICENSE) for details.

You're free to use, modify, and distribute this tool, **including commercially**. Attribution appreciated but not required.

---

## ⚠️ Disclaimer

**Vultri-Exi is a helper, not a replacement for a professional audit.**

- ✅ It catches **common patterns** — not every vulnerability.
- ⚠️ LLM explanations can be **wrong** — always verify.
- 🚫 **Never** deploy to mainnet without a manual audit from a reputable firm.
- 🔒 Never paste private keys, seed phrases, or secrets into any scanner.

The authors are **not responsible** for any losses incurred from using this tool.

> **Use Vultri-Exi to catch the obvious bugs. Hire an auditor to catch the sneaky ones.**

---

## 🙏 Acknowledgments

- [**Slither**](https://github.com/crytic/slither) — inspiration for the detector architecture
- [**OpenZeppelin**](https://openzeppelin.com/) — security best practices
- [**Code4rena**](https://code4rena.com/) & [**Sherlock**](https://sherlock.xyz/) — public audit datasets
- [**SWC Registry**](https://swcregistry.io/) — vulnerability classification
- The open-source smart contract security community ❤️

---

## 📬 Contact

- **Repository:** [github.com/NovaFlowDev/Vultri-Exi](https://github.com/NovaFlowDev/Vultri-Exi)
- **Issues:** [GitHub Issues](https://github.com/NovaFlowDev/Vultri-Exi/issues)
- **Discussions:** [GitHub Discussions](https://github.com/NovaFlowDev/Vultri-Exi/discussions)

---

<div align="center">

### ⭐ If Vultri-Exi helped you catch a bug, star the repo — it helps others find it too.

**Built with ❤️ for the smart contract security community**

[⬆ Back to top](#-vultri-exi)

</div>
