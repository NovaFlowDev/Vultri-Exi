# 🛡️ Vult-Exi

**AI-Powered Smart Contract Security Scanner**

Paste Solidity source. Static heuristics flag reentrancy, unchecked calls, access control, and zero-address issues. An LLM then explains findings and suggests defensive fixes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636)](https://soliditylang.org/)
[![Status](https://img.shields.io/badge/status-MVP-orange)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## 📖 Table of Contents

- [What Is Vult-Exi?](#-what-is-vult-exi)
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

---

## 🔍 What Is Vult-Exi?

Vult-Exi is an **open-source smart contract security scanner** that combines:

1. **Static analysis heuristics** — fast, deterministic pattern matching for known vulnerability classes.
2. **LLM-powered explanations** — human-readable reasoning about *why* a finding matters and *how* to fix it.

It's designed as a **pre-audit hygiene tool** — run it before spending $50k on a manual audit, catch the obvious bugs early, and hand auditors a cleaner codebase.

> **Goal:** Make smart contract security accessible to every developer, not just elite auditors.

---

## 💡 Why It Exists

Smart contract bugs are **catastrophic and irreversible**. Billions of dollars have been lost to:

- 🔁 **Reentrancy** — The DAO hack ($60M, 2016)
- 🔑 **Access control flaws** — Parity Wallet freeze ($150M, 2017)
- 📞 **Unchecked calls** — Countless silent fund losses
- 👻 **Zero-address bugs** — Permanent ownership bricking

Manual audits are **expensive** ($10k–$100k+) and **slow** (weeks).  
Vult-Exi gives developers a **free, instant first pass** so obvious bugs never reach production.

---

## ✨ Features

| Feature | Status |
|---|---|
| 🔁 Reentrancy detection | ✅ MVP |
| 📞 Unchecked external call detection | ✅ MVP |
| 🔑 Missing access control detection | ✅ MVP |
| 👻 Zero-address validation | ✅ MVP |
| 🤖 LLM explanations & fix suggestions | ✅ MVP |
| 📊 Risk dashboard with severity scoring | ✅ MVP |
| 🧠 Multi-agent adjudication (reduce false positives) | 🚧 Planned |
| 🔗 Slither integration | 🚧 Planned |
| ⚙️ CI/CD (GitHub Action) | 🚧 Planned |
| 📦 Foundry PoC generation | 🚧 Planned |
| 🌐 Multi-chain bytecode scanning | 🚧 Planned |

---

## ⚙️ How It Works
