# JurisAccess AI — Frontend Experience 🏛️

This directory houses the static, edge-optimized civil legal assistance frontend built strictly according to the **JurisAccess Intelligence Design System** (`website_design/jurisaccess_intelligence/DESIGN.md`) and deployable on **Cloudflare Pages**.

## Screen Directory
- **`index.html` / `triage.html`**: Emergency Legal Triage & Issue Intake (Category selector, narrative input, procedural threat gauge).
- **`analyze.html`**: Document Demystifier & Predatory Clause Scanner (Side-by-side legal redline and 6th-grade translations).
- **`rights.html`**: Tenant & Worker Rights Navigator (Interactive violation checklists & evidence docket).
- **`aid.html`**: Free Legal Aid & Pro Bono Clinic Locator (ZIP code & income eligibility pre-screener).
- **`action.html`**: Pro Se Demand Letter Builder (Customizable formal notices with certified mail slip).
- **`app.js`**: Unified client application logic connecting all screens to the Render backend API.

## Design System
- **Typography:** `Newsreader` (Editorial serif) + `Public Sans` (Institutional sans-serif).
- **Aesthetic:** Sharp 0px corners, high-contrast light mode, WCAG 2.1 AAA accessible.
- **Icons:** Google `Material Symbols Outlined`.

## Deployment on Cloudflare Pages
```bash
# Using Wrangler CLI
npx wrangler pages deploy . --project-name=jurisaccess-frontend
```
Or connect your GitHub repository directly in the Cloudflare Dashboard and set the build directory to `frontend`.
