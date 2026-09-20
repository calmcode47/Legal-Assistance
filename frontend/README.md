# JurisAccess AI — Frontend Experience 🏛️

This directory contains the Vite + React single-page experience for JurisAccess AI, built according to the **JurisAccess Intelligence Design System** (`website_design/jurisaccess_intelligence/DESIGN.md`) and deployable on **Vercel**.

## Screens
- **`/`**: Emergency legal triage and issue intake.
- **`/analyze`**: Document demystifier and predatory-clause scanner.
- **`/aid`**: Free legal-aid and pro bono locator.
- **`/action`**: Pro se demand-letter builder.

## Design System
- **Typography:** `Newsreader` (Editorial serif) + `Public Sans` (Institutional sans-serif).
- **Aesthetic:** Sharp 0px corners, high-contrast light mode, WCAG 2.1 AAA accessible.
- **Icons:** Google `Material Symbols Outlined`.

## Local development and verification
```bash
npm ci
npm test
npm run build
npm run dev
```

## Deployment on Vercel

Configure Vercel with `frontend` as the root directory, `npm run build` as the build command, and `dist` as the output directory. Set `VITE_API_URL` to the HTTPS origin of the deployed backend; the client appends `/api` automatically.
