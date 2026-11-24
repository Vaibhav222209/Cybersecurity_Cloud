<div align="center">

# ☁️ Ramzure

**Learn the cloud. Without the bill.**

A free, open-source cloud-portal simulator with built-in cybersecurity tooling —
virtual machines, databases, networking, Defender-style posture management, a SIEM, identity protection, Key Vault and more.
Everything runs 100% in your browser.

[![CI](https://github.com/Vaibhav222209/ramzure/actions/workflows/ci.yml/badge.svg)](https://github.com/Vaibhav222209/ramzure/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)

**Created by [Vaibhav Thakur](https://github.com/Vaibhav222209)**

</div>

---

## 💡 Why Ramzure?

Real cloud platforms are brilliant — but learning on them can cost money, and a forgotten VM can ruin your month.
Ramzure gives you the *feel* of an enterprise cloud portal and the concepts behind it with **zero cost and zero risk**.
Break things. Misconfigure things. Fix them. Learn.

> ⚠️ **Disclaimer:** Ramzure is an independent educational project. It is **not** affiliated with, endorsed by, or sponsored by Microsoft. Product names mentioned belong to their respective owners.

## ✨ Features

| Area | What you can do |
| --- | --- |
| 🏠 **Portal** | Dashboard, global search (`Ctrl + /`), notifications, activity log |
| 🧱 **Resources** | Create / start / stop / delete VMs, Storage, SQL, Web Apps, Functions, VNets, AKS, Cosmos DB, Key Vault with a 3-step wizard & simulated deployment |
| 🛡️ **Security Center** | Secure-score engine, 13 recommendations with one-click remediation, MITRE ATT&CK mapping |
| 🧬 **Defender plans** | 9 workload protection plans (Servers, Storage, SQL, Containers, …) |
| 📡 **Sentinel (SIEM/SOAR)** | Live simulated threat feed, block attacker IPs into the NSG, auto-response playbook |
| 🪪 **Identity (Entra-style)** | Users, per-user MFA, Conditional Access policies |
| 🔥 **Network security** | NSG rule editor with risky-rule detection, Firewall / WAF / DDoS toggles |
| 🔑 **Key Vault** | Create, reveal, copy, rotate and delete secrets; purge-protection settings |
| 📜 **Compliance** | ISO 27001, SOC 2, NIST 800-53, PCI DSS, CIS, GDPR dashboards |
| 🔐 **Secure sign-in** | Password-strength meter and simulated authenticator MFA step |
| 🧭 **Discover** | Service explorer, 4 learning paths, concept explainers (shared responsibility, defence in depth, Zero Trust), security quiz, free-learning resources |
| 💻 **Cloud Shell** | A real working `rz` CLI in the browser |
| 💰 **Cost Management** | $200 sandbox credit, budgets, savings advisor |

## 🚀 Quick start

```bash
git clone https://github.com/Vaibhav222209/ramzure.git
cd ramzure
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
```

Requires **Node.js 18+**.

## 💻 Cloud Shell cheat-sheet

```bash
rz resource list
rz vm create --name vm-demo-01 --sku B2s --region "Central India"
rz security score
rz security recs
rz security fix mfa
rz security nsg deny --port 3389
rz keyvault secret set --name db-password
rz cost show
```

## 🗂️ Project structure

```
ramzure/
├── .github/               # CI, Pages deploy, templates, dependabot
├── src/
│   ├── App.tsx            # Routing + sign-in gate
│   ├── Landing.tsx        # Marketing page + MFA sign-in
│   ├── Shell.tsx          # Top bar, search, sidebar
│   ├── store.tsx          # State, persistence, secure-score engine
│   ├── data.ts            # Service catalog & security data
│   ├── ui.tsx             # Design-system primitives
│   └── pages/             # Home, Resources, Create, Security, Discover, Cloud Shell, …
├── LICENSE  README.md  SECURITY.md  CONTRIBUTING.md  CODE_OF_CONDUCT.md
└── index.html
```

## 🌐 Deploy to GitHub Pages (free)

1. Push this repo to `github.com/Vaibhav222209/ramzure`.
2. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` — the included `deploy.yml` workflow publishes the site.

## 🔒 Privacy

No backend. No analytics. No accounts. All state lives in your browser's `localStorage` and can be wiped with **User menu → Reset sandbox**.

## 🤝 Contributing

Contributions are very welcome — new services, new security labs, more quiz questions!
See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

[MIT](LICENSE) © 2026 Vaibhav Thakur

---

<div align="center">
Made with ❤️ by <a href="https://github.com/Vaibhav222209"><b>Vaibhav Thakur</b></a> · If Ramzure helps you learn, drop a ⭐
</div>
