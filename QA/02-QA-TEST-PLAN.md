# AI CRYPTO HQ — COMPREHENSIVE QA TEST PLAN
**Date:** 2026-09-24  
**Target:** Staging & Live Production Readiness Gate Verification  
**Standard:** Zero Fabricated Results / Measured Runtime Tests Only  

---

## 1. Scope of Test Execution

This test plan defines the automated, functional, security, financial, and failure recovery checks across 23 domains:

| # | Test Domain | Verification Method | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **1** | **Frontend** | React 19 component render & hook hydration | Zero uncaught UI render exceptions, 0 broken views |
| **2** | **Backend / Service Layer** | Deterministic engine assertions (`qaRunner.ts`) | Strict algorithmic accuracy across all engines |
| **3** | **Database & Storage** | LocalStorage read/write roundtrip & serialization | 100% data integrity, 0 corrupted payload bytes |
| **4** | **Authentication** | Web3 Non-custodial session lifecycle | Session preservation across page reload |
| **5** | **Authorization & RBAC** | 3-tier organizational hierarchy enforcement | Workers cannot dispatch or approve expenditures |
| **6** | **AI Agent System** | 7 Core Agent roles, workstations, and status checks | All 7 agents active with unique departmental roles |
| **7** | **Agent State Machine** | Valid/Invalid transitions (`IDLE`, `WALKING`, etc.) | Invalid transitions (e.g. `IDLE` -> `EXECUTION`) blocked |
| **8** | **Task Orchestration** | Task priority queue & dispatcher | Higher priority tasks preempt lower priority queue items |
| **9** | **Workflow Engine** | 10-stage sequential pipeline execution loop | 10/10 sequential checkpoints verified |
| **10** | **Security Controls** | Sentinel bytecode decompiler & prompt injection filter | 100% drainers & prompt injection attempts vetoed |
| **11** | **Compliance Controls** | OFAC SDN sanctions screening & MiCA categorization | Blacklisted addresses/routers blocked instantly |
| **12** | **Wallet Integration** | Strict EVM regex validation (`0xe544...734E`) | Checksum & 42-char EVM hex format verified |
| **13** | **Financial Controls** | Daily spending cap ($500) & root human approval | Transactions exceeding threshold mandate human sign-off |
| **14** | **Emergency Stop** | Global freeze test during research, AI reasoning, & tx | All autonomous processes halt in `< 2.5ms` |
| **15** | **Error Handling & Resilience** | Auto-retry with backoff on transient RPC/network faults | Automatic recovery up to `maxRetries` without crash |
| **16** | **Recovery & Idempotency** | Watchdog auto-unstuck & duplicate prevention | Duplicate execution & reward credit prevented |
| **17** | **Performance** | PixiJS render loop FPS & interaction latency | Average FPS >= 55, P95 UI interaction < 200ms |
| **18** | **Browser Compatibility** | Standard Web APIs (`localStorage`, `Canvas`, `crypto`) | Cross-browser compatibility without polyfill gaps |
| **19** | **Responsive UI** | Breakpoints: 320px, 375px, 768px, 1024px, 1440px | Zero horizontal overflow, mobile drawer accessibility |
| **20** | **Accessibility** | ARIA labels, color contrast ratios, keyboard control | WCAG 2.1 AA compliance standards met |
| **21** | **Deployment Verification** | Vite build & tree-shaking bundle validation | Clean `npm run build` output in `dist/` |
| **22** | **Monitoring & Auditing** | SHA-256 hash-chained immutable audit ledger | Zero broken cryptographic block hash links |
| **23** | **Backup & Snapshot** | System JSON snapshot serializer/deserializer | Full state exportable and restorable |

---

## 2. Test Execution Protocol
- **Runner Engine:** Automated execution via `ProductionQARunner` in `src/services/qaRunner.ts`.
- **Telemetry:** Real-time millisecond-precision step streaming with retry count logging.
- **Release Gating:** Staging -> Limited Live -> Full Live (Explicit Root Human Authorization Required).
