# Engineering, Ethics & Prompt Rules: JurisAccess AI

**Rulebook Version:** 1.0.0  
**Scope:** Universal Backend, AI Agents, Security Middleware, and Prompt Architectures  
**Status:** ENFORCED  

---

## 1. Code Quality & Architectural Rules (`ENG-RULES`)

1. **Strict TypeScript Typing (`ENG-001`):**
   - No implicit `any` permitted. Every function, parameter, and return value must declare strict types.
   - External inputs must be parsed and validated using **Zod** schemas before reaching controller logic.
2. **Clean Layer Decoupling (`ENG-002`):**
   - `Controllers` handle HTTP protocol logic (status codes, headers, parameter extraction) only.
   - `Agents` orchestrate cognitive loops and call services/prompts.
   - `Guardrails` operate as pure, deterministic transformation functions (e.g. `sanitize(input) -> { text, tokens }`).
   - `Services` encapsulate domain databases, LLM calls, and caches.
3. **Immutability & Statelessness (`ENG-003`):**
   - Agents and controllers must remain completely stateless between requests.
   - PII token tables exist only in ephemeral memory for the lifecycle of a single request.
4. **Resilient Error Handling (`ENG-004`):**
   - Zero unhandled promise rejections.
   - Never leak internal stack traces, system paths, or environment variables to client responses. Standardized JSON error response:
     ```json
     {
       "success": false,
       "error": {
         "code": "VALIDATION_ERROR",
         "message": "User-friendly description",
         "timestamp": "2026-09-14T20:30:00Z"
       }
     }
     ```

---

## 2. Security & Privacy Rules (`SEC-RULES`)

1. **Universal Pre-Inference PII Sanitization (`SEC-001`):**
   - No untrusted text containing raw Social Security Numbers, Tax IDs, Aadhaar numbers, phone numbers, email addresses, credit cards, or street addresses shall ever be transmitted to third-party LLM APIs.
   - The tokenization engine (`piiScrubber`) must run before prompt assembly.
2. **Adversarial Delimiter Sandboxing (`SEC-002`):**
   - User inputs must always be quarantined within strict XML tags: `<litigant_document_content>...</litigant_document_content>`.
   - Prompts must contain explicit instructions that text inside delimiters is passive data, not commands.
3. **Canary Leak Detection (`SEC-003`):**
   - Every system prompt shall contain a unique request-specific canary token.
   - If the canary token appears in the generated output, the response must be aborted, quarantined, and flagged as a prompt extraction exploit.
4. **Rate Limiting & Abuse Prevention (`SEC-004`):**
   - Sliding-window rate limiting enforced per IP: max 60 requests/minute for read operations, 20 requests/minute for AI loop operations.

---

## 3. Legal Ethics & UPL Rules (`LEGAL-RULES`)

1. **Unauthorized Practice of Law (UPL) Demarcation (`LEG-001`):**
   - Under American Bar Association (ABA) Model Rule 5.5 and state bar ethics, the platform provides **legal information, procedural education, and document demystification**, NOT individualized legal counsel.
   - The system must never use prescriptive phrases such as *"You must testify that..."* or *"I advise you to sue your landlord."*
   - Permissible phrasing: *"Under statutory code §..., tenants have the right to... Actionable options typically include..."*
2. **Mandatory Dynamic Educational Disclaimer (`LEG-002`):**
   - Every user-facing response must automatically append the educational disclaimer:
     > *"Notice: JurisAccess AI is an automated educational tool designed to assist self-represented litigants. It does not provide formal legal representation, legal advice, or establish an attorney-client relationship. If facing an imminent court date or illegal lockout, please consult a licensed attorney or contact your local legal aid clinic immediately."*
3. **Emergency Escalation Rule (`LEG-003`):**
   - Whenever an input triggers domestic abuse, physical eviction enforcement within 24 hours, or imminent deportation, the response must prepend verified emergency hotline contacts:
     - *National Domestic Violence Hotline: 1-800-799-SAFE (7233) | SMS: Text 'START' to 88788*
     - *National Tenant Defense Emergency Network / 211 Civil Legal Support*

---

## 4. Anti-Hallucination & Citation Rules (`GROUND-RULES`)

1. **Zero Invented Precedents (`GRO-001`):**
   - The AI must never invent fictitious court cases, docket numbers, or nonexistent statutory sections.
   - When citing statutory authority, it must reference verified benchmark statutes (e.g., *Uniform Residential Landlord and Tenant Act (URLTA)*, *Fair Debt Collection Practices Act (15 U.S.C. § 1692)*, *California Civil Code § 1950.5*, etc.).
2. **Grounding Fallback Protocol (`GRO-002`):**
   - If a legal statute or precedent cannot be verified with 100% confidence, the AI must explicitly qualify the statement: *"Common legal standards in this jurisdiction typically require... (Specific statutory citation requires attorney verification)."*
3. **Critic Convergence Verification (`GRO-003`):**
   - No response may be released to the user without passing the Senior Legal Critic with a score of `>= 95/100` and zero UPL or hallucination flags.

---

## 5. Prompt Engineering Rules (`PROMPT-RULES`)

1. **Role & Constraint Clarity:**
   - Define exact persona, audience reading level (6th grade), and explicit negative constraints (`DO NOT`, `NEVER`).
2. **Structured JSON Output:**
   - Always require LLMs to emit strict, typed JSON conforming to validated TypeScript schemas.
   - Eliminate Markdown wrapper pollution (````json ... ````) via programmatic regex stripping before parsing.
3. **Few-Shot Grounding:**
   - Include high-quality few-shot examples demonstrating proper plain-language translation and balanced risk scoring.
4. **Token Economy:**
   - Prompts must be concise, structured, and free of redundant prose to maximize efficiency and minimize latency.

---

## 6. Repository & Submission Rules (`REPO-RULES`)

1. **Size Discipline:**
   - Total repository size must strictly remain `< 10 MB` (target: `< 2 MB`).
   - Never commit `node_modules`, `.env`, build artifacts (`dist/`, `build/`), or coverage directories.
2. **Single Branch Constraint:**
   - All commits and working trees must remain exclusively on `main`. No alternative branches.
3. **Public Accessibility:**
   - The repository must remain public on GitHub at `calmcode47/Legal-Assistance`.
