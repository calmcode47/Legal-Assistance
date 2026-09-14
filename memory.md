# Project Memory & Canonical Registry: JurisAccess AI

**Project Name:** JurisAccess AI (LexisLoop)  
**Lifecycle State:** `BUILD_TRACKING`  
**Assurance Profile:** `HIGH_ASSURANCE`  
**Current Revision:** `REV-001`  
**Repository Baseline:** `calmcode47/Legal-Assistance` (Branch: `main`)  
**Target Competition:** PromptWars — Exclusive Edition (Hack2Skill)  

---

## 1. Defining Value & Scope Boundary

JurisAccess AI provides accessible, hallucination-resistant, and privacy-preserving civil legal intelligence for self-represented individuals facing housing, employment, and consumer crises. It utilizes a **Loop Engineering (Generator-Critic-Refiner)** cognitive loop, two-way PII tokenization, and strict ethical disclaimers conforming to ABA Model Rules.

---

## 2. Canonical Registry

### Functional Requirements (`REQ-###`)

| ID | Statement | Source | Status | Canonical Owner | Depends On | Verification | Disposition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Multi-category legal triage and statutory deadline urgency scoring. | Brief & PRD | `VERIFIED` | `src/agents/triageAgent.ts` | None | `tests/triageAgent.test.ts` | Active |
| `REQ-002` | Plain-language contract and notice demystifier with clause risk grading. | Brief & PRD | `VERIFIED` | `src/agents/explainerAgent.ts` | `SEC-001` | `tests/loopEngine.test.ts` | Active |
| `REQ-003` | Closed-loop Generator-Critic self-correction engine with >=95% convergence threshold. | User Request | `VERIFIED` | `src/agents/loopEngine.ts` | `REQ-001`, `REQ-002` | `tests/loopEngine.test.ts` | Active |
| `REQ-004` | LSC-compliant legal aid and pro bono directory matcher by ZIP/income. | Brief & PRD | `VERIFIED` | `src/agents/matcherAgent.ts` | `REQ-001` | `tests/api.test.ts` | Active |
| `REQ-005` | Formal Pro Se legal demand notice and letter generation engine. | Brief & PRD | `VERIFIED` | `src/services/legalAidService.ts` | `REQ-002` | `tests/api.test.ts` | Active |

### Security & Compliance Requirements (`SEC-###`)

| ID | Statement | Source | Status | Canonical Owner | Depends On | Verification | Disposition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SEC-001` | Real-time two-way PII tokenization (SSN, phone, email, IDs, addresses). | Rubric & PRD | `VERIFIED` | `src/guardrails/piiScrubber.ts` | None | `tests/piiScrubber.test.ts` | Active |
| `SEC-002` | Prompt injection defense with XML delimiter fencing and canary token detection. | Rubric & PRD | `VERIFIED` | `src/guardrails/injectionGuard.ts` | None | `tests/injectionGuard.test.ts` | Active |
| `SEC-003` | Unauthorized Practice of Law (UPL) guardrail and dynamic educational disclaimer. | Legal Ethics | `VERIFIED` | `src/guardrails/uplGuard.ts` | None | `tests/loopEngine.test.ts` | Active |
| `SEC-004` | Anti-hallucination citation verification against statutory ground truth. | Legal Ethics | `VERIFIED` | `src/guardrails/citationValidator.ts`| `REQ-003` | `tests/loopEngine.test.ts` | Active |
| `SEC-005` | Zero-trust Firebase Firestore security rules forbidding unauthenticated writes. | Rubric | `VERIFIED` | `firestore.rules` | None | Static inspection | Active |

### Architectural Decisions (`DEC-###`)

| ID | Statement | Rationale | Status |
| :--- | :--- | :--- | :--- |
| `DEC-001` | Implement backend in TypeScript on Node 20 with Firebase Functions/Express. | Ensures type safety, robust async handling, seamless Firebase deployment, and high maintainability. | `APPROVED` |
| `DEC-002` | Use multi-loop cognitive architecture (Generator -> Critic -> Refiner). | Elevates accuracy and safety beyond single-shot prompting; directly satisfies the promptwars "loop engineering" mandate. | `APPROVED` |
| `DEC-003` | Implement dual-mode LLM Service (Gemini API + deterministic mock fallback). | Enables standalone CI execution, automated testing without external API keys, and seamless live cloud inference. | `APPROVED` |
| `DEC-004` | Strictly decouple frontend specification (`frontend.md`) for Stitch MCP integration. | Enables the user to generate clean, modular UI screens inside their IDE using Stitch while keeping backend pure and lean. | `APPROVED` |
| `DEC-005` | Enforce repository size `< 2 MB` through comprehensive `.gitignore`. | Outperforms the PromptWars 10 MB limit by 5x; guarantees zero failed submissions due to bloat. | `APPROVED` |

### Non-Goals (`NON-###`)

| ID | Statement |
| :--- | :--- |
| `NON-001` | The platform does not establish an attorney-client relationship or provide formal court representation. |
| `NON-002` | The platform does not store raw citizen PII on persistent disk storage. |
| `NON-003` | The platform does not support criminal defense litigation beyond initial procedural referral to public defenders. |

### Material Risks & Mitigations (`RISK-###`)

| ID | Risk Description | Severity | Mitigation Strategy | Status |
| :--- | :--- | :--- | :--- | :--- |
| `RISK-001` | LLM generates fictitious statute numbers or case precedents. | High | Deterministic citation validator scans against verified statutory dictionary; Critic agent rejects ungrounded claims. | Mitigated |
| `RISK-002` | Citizen uploads eviction summons containing SSN and child custody data. | High | `piiScrubber` masks identifiers in memory before prompts leave the application boundary. | Mitigated |
| `RISK-003` | Malicious prompt injection tries to compel AI to draft fraudulent affidavits. | High | `injectionGuard` detects adversarial jailbreaks, resets session, and logs security event. | Mitigated |
| `RISK-004` | High LLM API latency degrades user experience during eviction emergencies. | Medium | In-memory LRU cache serves frequent statutory FAQs and legal aid clinic directory lookups in `< 25ms`. | Mitigated |
| `RISK-005` | Repository accidentally includes `node_modules` or `.env` breaching the 10 MB limit. | High | Hardened `.gitignore` and pre-commit size check script ensure repo size remains `< 2 MB`. | Mitigated |

---

## 3. Session Progress & Reconciliation

- **Session 01:** Architecture proposal approved (`REV-001`).
- **Session 02:** PRD, Memory Registry, and Core Governance compiled.
- **Session 03:** TypeScript backend scaffolding, guardrails, and loop engine implementation.
- **Session 04:** Automated test suite execution & verification.
- **Session 05:** Frontend Stitch specification and PromptWars README delivery.
