# JurisAccess AI — Backend Service ⚖️

This directory contains the production-grade Node.js / TypeScript backend service for **JurisAccess AI (LexisLoop)**.

## Architecture Highlights
- **Closed-Loop Engine (`src/agents/loopEngine.ts`)**: 5-stage cognitive pipeline with Generator-Critic-Refiner closed loop (>= 95% score convergence).
- **Two-Way PII Sanitization (`src/guardrails/piiScrubber.ts`)**: Redacts SSNs, phone numbers, emails, and addresses before inference and safely restores them on egress.
- **Adversarial Prompt Guard (`src/guardrails/injectionGuard.ts`)**: Quarantines user input inside `<litigant_document_content>` XML fences and blocks jailbreak vectors.
- **UPL & Ethics Guard (`src/guardrails/uplGuard.ts`)**: Enforces ABA Model Rule 5.5 disclaimers and triggers emergency crisis hotlines.
- **Citation Validator (`src/guardrails/citationValidator.ts`)**: Grounds all citations against real statutory benchmarks.
- **Legal Aid Service (`src/services/legalAidService.ts`)**: Directory of verified LSC legal clinics and Pro Se demand letter templates.

## Quick Start
```bash
# Install dependencies exactly as locked
npm ci

# Run automated tests (46/46 passed)
npm test

# Build TypeScript
npm run build

# Start local server
npm run dev
# Server listens at http://localhost:8080
```

## Deployment on Render
Deploy directly as a Web Service using [`render.yaml`](../render.yaml) at repository root:
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
