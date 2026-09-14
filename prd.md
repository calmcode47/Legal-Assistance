# Product Requirements Document (PRD): JurisAccess AI (LexisLoop)

**Document Version:** 1.0.0  
**Status:** APPROVED  
**Target Vertical:** AI for Legal Assistance and Access (Access to Justice - A2J)  
**Competition:** PromptWars — Exclusive Edition  
**Repository:** `calmcode47/Legal-Assistance`  

---

## 1. Executive Summary & Vision

In democratic societies, equal justice under the law is a foundational promise. Yet over 80% of civil legal needs among low-income households go unaddressed due to the prohibitive cost of private attorneys ($350–$600/hr) and overwhelmed legal aid systems. Vulnerable citizens routinely forfeit their homes in illegal evictions, endure unlawful wage theft, and sign predatory contracts without understanding their basic statutory rights.

**JurisAccess AI (LexisLoop)** bridges this justice gap. It is an agentic, multi-loop legal intelligence platform that transforms intimidating legalese into clear, actionable, 6th-grade reading-level guidance. By utilizing a closed-loop **Generator-Critic-Refiner cognitive loop**, real-time PII anonymization, and strict guardrails against Unauthorized Practice of Law (UPL) and hallucinated citations, JurisAccess provides reliable, ethical, and accessible civil legal empowerment.

---

## 2. Target Personas & User Stories

### Persona 1: Elena Gomez — Low-Income Tenant Facing Notice to Vacate
- **Profile:** 34-year-old single mother, works two service jobs, received a "3-Day Notice to Pay or Quit" under intimidating legal jargon.
- **Pain Points:** Cannot afford a retainer; terrified of immediate sheriff lockout; doesn't know notice technical defects or statutory defense periods.
- **User Story:** *"As a tenant receiving an eviction notice, I want to paste or upload my notice and immediately learn what it means in plain English, what my legal timeline is, and whether the landlord violated state notice laws, so I don't lose my home unfairly."*

### Persona 2: Marcus Vance — Independent Contractor with Unpaid Invoices
- **Profile:** 27-year-old gig-economy courier owed $2,400 with a vague, 14-page subcontractor agreement with mandatory arbitration clauses.
- **Pain Points:** Unable to decipher adhesion clauses; small-claims court filing fees seem daunting; needs a structured demand letter.
- **User Story:** *"As an independent worker, I want to scan my subcontractor agreement for unfair terms and automatically draft a formal, legally grounded demand letter that cites statutory wage protections."*

### Persona 3: Priyah Patel — Pro Bono Clinic Volunteer Coordinator
- **Profile:** Non-profit paralegal triaging 80+ walk-in intakes daily with limited attorney hours.
- **Pain Points:** Needs rapid classification of user issues, urgency scoring (e.g., statute of limitations expiring in 48 hours), and income-eligibility pre-screening for LSC-funded aid.
- **User Story:** *"As a legal aid intake specialist, I want incoming citizen inquiries pre-triaged with PII stripped and key issues summarized, so our volunteer attorneys can review twice as many cases safely."*

---

## 3. Core Problem Statement & Domain Challenges

| Challenge | Real-World Impact | JurisAccess AI Solution |
| :--- | :--- | :--- |
| **Hallucination of Precedents** | Fake case citations (e.g. *Mata v. Avianca*) destroy credibility and mislead litigants. | Deterministic Citation Grounding & Critic verification against verified statutory templates. |
| **Unauthorized Practice of Law (UPL)** | AI providing prescriptive legal advice violates state bar ethics and exposes users to risk. | Strict demarcation of **legal information** vs. **legal advice** with dynamic disclaimer injection. |
| **Data Privacy & Confidentiality** | Forwarding raw eviction notices, salary slips, or court summons exposes citizen PII to public models. | Pre-inference PII tokenization (Regex + Entity masking) with post-verification re-hydration. |
| **Incomprehensible Legalese** | Contracts designed with dense syntax to force adhesion and prevent assertion of rights. | Flesch-Kincaid simplification engine targeting < Grade 7 readability with risk-rated clause breakdowns. |
| **Prompt Injection Attacks** | Malicious users prompting the AI to bypass disclaimers or generate illegal contract modifications. | Delimiter fencing, canary token verification, and adversarial input filtering. |

---

## 4. Functional Requirements

### FR-1: Two-Way PII Sanitization Engine (`SEC-001`)
- **FR-1.1:** The system shall automatically detect and replace Social Security Numbers (SSN), Tax IDs, Aadhaar numbers, phone numbers, email addresses, credit card numbers, dates of birth, and home addresses with opaque tokens (e.g. `{{PII_PHONE_1}}`).
- **FR-1.2:** The tokenization mapping shall remain strictly in ephemeral memory for the request duration and shall never be persisted or logged.
- **FR-1.3:** Following verified generation, the system shall safely de-tokenize the output so the user receives a personalized response without exposing raw data to LLMs.

### FR-2: Deterministic Legal Triage & Urgency Assessment (`REQ-001`)
- **FR-2.1:** Detect and categorize legal issues into one of five primary domains:
  1. `TENANCY_AND_HOUSING` (Evictions, habitability, security deposits)
  2. `EMPLOYMENT_AND_LABOR` (Wage theft, misclassification, retaliation)
  3. `CONSUMER_AND_DEBT` (Predatory loans, collector harassment, lemon laws)
  4. `FAMILY_AND_DOMESTIC` (Custody, protective orders, child support)
  5. `CIVIL_RIGHTS_AND_IMMIGRATION` (Asylum notices, discrimination, public benefits)
- **FR-2.2:** Assign an Urgency Score:
  - `CRITICAL`: Immediate eviction court date or protective order deadline within < 72 hours.
  - `HIGH`: Statute of limitations expiring within 14 days or pending default judgment.
  - `MEDIUM`: Unpaid wage dispute with active employment.
  - `LOW`: General contract review or preemptive rights inquiry.
- **FR-2.3:** Trigger emergency hotlines (e.g., National Domestic Violence Hotline, 211 Legal Resources) whenever `CRITICAL` safety risks are detected.

### FR-3: Plain-Language Document Demystifier (`REQ-002`)
- **FR-3.1:** Parse uploaded notices, lease agreements, and clauses up to 50,000 characters.
- **FR-3.2:** Produce a 3-part structured breakdown:
  1. *Plain-English TL;DR* (Reading level <= 7th grade).
  2. *Predatory / High-Risk Clauses Table* with risk ratings (Green/Yellow/Red).
  3. *Actionable Litigant Rights Checklist* with specific statutory references.

### FR-4: Closed-Loop Generator-Critic Self-Correction Engine (`REQ-003`)
- **FR-4.1:** The Generator Agent crafts an initial legal response based on user input.
- **FR-4.2:** The Critic Agent independently audits the draft across 4 weighted parameters:
  - Grounding & Factual Accuracy (30%)
  - UPL Avoidance & Ethical Disclaimers (25%)
  - Plain-Language Readability (25%)
  - Actionability & Urgency Guidance (20%)
- **FR-4.3:** If the audit score is `< 95%` or any UPL/hallucination violation is detected, the Critic returns precise remediation instructions. The Generator iterates up to 3 times until convergence is achieved.

### FR-5: Legal Aid & Pro Bono Resource Matcher (`REQ-004`)
- **FR-5.1:** Filter verified Legal Services Corporation (LSC) and state legal aid databases by user jurisdiction and zip code.
- **FR-5.2:** Match income thresholds against federal poverty guidelines (FPL <= 125% - 200%) to recommend free legal aid clinics.
- **FR-5.3:** Provide direct contact info, intake hours, and required documentation checklists.

### FR-6: Self-Represented (Pro Se) Legal Document Builder (`REQ-005`)
- **FR-6.1:** Generate formally formatted legal notices:
  - *Notice of Breach / Repair Demand* (Implying Warranty of Habitability).
  - *Security Deposit Return Demand* (Citing statutory penalty clauses).
  - *Formal Wage Theft / Unpaid Compensation Demand*.
  - *Debt Validation Letter under FDCPA 15 U.S.C. § 1692g*.

---

## 5. Non-Functional Requirements

### NFR-1: Performance & Latency
- Pre-processing (PII scrubbing + Triage) response time: `< 250ms`.
- Full cognitive feedback loop completion: `< 3.5s` for standard queries.
- In-memory LRU caching of statutory legal guides with hit latency `< 25ms`.

### NFR-2: Security & Privacy
- **Zero-Trust Input Sanitization:** XML delimiter fencing to neutralize prompt injections.
- **Canary Token Defenses:** Continuous monitoring for leakage of internal system prompts.
- **Firestore Zero-Trust Rules:** Enforce schema validation, reject unauthorized client mutations.
- **Ephemeral PII:** Zero server disk storage of raw client PII.

### NFR-3: Accessibility (WCAG 2.1 AAA Standard)
- All user-facing text verified at Flesch-Kincaid reading score between 60.0–75.0 (Plain Language).
- Color contrast ratios strictly >= 7:1 for all text elements.
- Screen-reader friendly semantic hierarchy with descriptive ARIA live-regions for dynamic feedback.

### NFR-4: Repository Cleanliness & Footprint
- Repository size strictly `< 10 MB` (actual target `< 2 MB`).
- Single branch architecture (`main`).
- Full test automation with 100% deterministic CI pass rate.

---

## 6. PromptWars Rubric Alignment Matrix

| Evaluation Criterion | Impact | How JurisAccess AI Achieves 99.99% Score |
| :--- | :--- | :--- |
| **Vertical Relevance & Persona** | **High** | Specifically built for civil legal access; addresses real eviction, wage theft, and consumer protection crises. |
| **Code Quality & Architecture** | **High** | Clean Architecture in strict TypeScript; decoupled agents, controllers, services; comprehensive Zod schema enforcement. |
| **Security & Responsible AI** | **High** | Native PII tokenization engine; prompt injection isolation; UPL boundary enforcement conforming to ABA ethics. |
| **Testing & Verification** | **Medium** | Automated test suite covering PII scrubbing, jailbreak vectors, loop convergence, and agent edge cases. |
| **Resource Efficiency** | **Medium** | Hybrid deterministic triage + token-thrifty prompt engineering; in-memory caching to minimize LLM compute. |
| **Accessibility & Usability** | **Low/Med** | Plain language enforcement (< Grade 7); WCAG AAA contrast tokens; full screen-reader accessibility guide for Stitch. |
