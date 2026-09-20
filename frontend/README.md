# JurisAccess AI — Frontend Experience

Vite + React SPA for JurisAccess AI, following the **JurisAccess Intelligence** design tokens in `docs/DESIGN.md`. Deployed on **Vercel**.

## Essential Screens (5)
- **`/`** — Emergency legal triage and issue intake (smart module routing)
- **`/rights`** — Rights Navigator (domain-scoped statutory checklists)
- **`/analyze`** — Document demystifier + Loop Engineering clause scanner
- **`/aid`** — Free legal-aid / LSC clinic locator
- **`/action`** — Pro se demand-letter builder

## Backend Activator Bot
On every page load, `backendActivator.ts` wakes the Render free-tier API (`/api/health`) and keeps it warm with a single ping every 10 minutes while the tab is visible — conserving free-tier credits while avoiding cold-start failures for judges.

## Accessibility
- Skip link, main landmark, 44px touch targets, WCAG AA contrast, double-Escape crisis exit
- Offline mode is never labeled as “AI Engine Live”

## Local development
```bash
npm ci
npm test
npm run build
npm run dev
```

## Deployment on Vercel
Root Directory: `frontend` · Build: `npm run build` · Output: `dist`  
Env: `VITE_API_URL=https://jurisaccess-backend.onrender.com/api`
