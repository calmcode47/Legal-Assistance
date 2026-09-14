# Frontend Architecture & Stitch MCP Specifications: JurisAccess AI

**Document Version:** 1.0.0  
**Design System:** LexisGuard UI (Civil Justice Dark/Light High-Contrast)  
**Accessibility Target:** WCAG 2.1 AAA Compliant  
**Integration Target:** Stitch MCP Server & Firebase Hosting  

---

## 1. Design System & Visual Tokens

To ensure maximum accessibility, trust, and clarity for distressed citizens facing legal crises, JurisAccess uses a calm, authoritative, high-contrast palette with clear visual risk signifiers.

### Color Palette Tokens
| Token Name | Hex Code | Purpose & Contrast Ratio |
| :--- | :--- | :--- |
| `--bg-primary` | `#0B0F19` | Deep Obsidian Canvas (Dark Mode Primary) |
| `--bg-surface` | `#1E293B` | Elevated Cards & Input Containers |
| `--bg-surface-elevated` | `#334155` | Modal Dialogs, Floating Toolbars |
| `--text-primary` | `#F8FAFC` | High-Contrast Headings & Body Text (Contrast 14.8:1) |
| `--text-muted` | `#94A3B8` | Subtitles, Secondary Metadata, Helper Labels |
| `--accent-primary` | `#6366F1` | Electric Indigo (Primary CTAs, Active States) |
| `--accent-secondary` | `#38BDF8` | Cyan Glow (Informational Badges, Safe Highlights) |
| `--risk-critical` | `#EF4444` | Red Alert (Eviction notice, court date < 72 hrs) |
| `--risk-warning` | `#F59E0B` | Amber Caution (Predatory clause, statutory deadline) |
| `--risk-safe` | `#10B981` | Emerald Green (Enforceable tenant/worker right) |
| `--border-subtle` | `#334155` | 1px border dividers |

### Typography Tokens (Google Fonts: Inter + Plus Jakarta Sans)
- **Display Heading:** `Plus Jakarta Sans`, 700 Weight (Bold), tracking `-0.02em`.
- **Body & Legal Copy:** `Inter`, 400 & 500 Weight, line-height `1.65` for optimal readability.
- **Monospace Code/Notice:** `JetBrains Mono`, 500 Weight (Statutory citations, clause numbers).

---

## 2. Screen Sitemap & Navigation Flow

```
[ Navigation Bar: Emergency Legal Hotline Banner (Always Visible) ]
                             │
       ┌─────────────────────┼─────────────────────┬─────────────────────┐
       ▼                     ▼                     ▼                     ▼
[ 1. / Triage ]      [ 2. /analyze ]        [ 3. /rights ]        [ 4. /aid ]        [ 5. /action ]
Emergency Intake     Document Demystifier   Rights Navigator      Pro Bono Locator   Pro Se Letter Builder
& Urgency Meter      & Clause Scanner       Interactive QA        & Clinic Map       & PDF/Text Export
```

---

## 3. Detailed Screen Specifications & Stitch MCP Prompts

---

### Screen 1: Legal Emergency Triage & Issue Intake (`/`)

#### Purpose
The entry point for citizens in legal crisis. Allows instant identification of legal domain, urgency assessment, and immediate escalation if court deadlines or physical lockouts are imminent.

#### Key Features & Components
1. **Emergency Banner:** Fixed top bar with clickable one-touch emergency hotlines (Domestic Violence, Tenant Emergency Lockout Hotline).
2. **Plain-Language Problem Input:** Text area with voice-input button allowing users to describe their situation in everyday words.
3. **Category Selector Pills:** Quick-select tags (`Eviction & Landlord`, `Unpaid Wages`, `Debt Collection`, `Child Support`, `Immigration`).
4. **Real-Time Urgency Meter:** Dynamic visual gauge showing severity (Low -> Medium -> High -> Critical).
5. **PII Protection Indicator:** Visual green badge reassuring users: *"🔒 Zero-Trace: Names, phone numbers & SSNs automatically stripped before processing."*

#### Stitch MCP Generation Prompt
> **Stitch Command:** `generate_screen_from_text`
```text
Design a sleek, accessible, high-contrast Legal Emergency Triage dashboard for JurisAccess AI. The canvas is deep obsidian dark (#0B0F19) with elevated slate cards (#1E293B). At the top, include a high-visibility emergency alert banner with a phone icon: 'Facing illegal lockout or 24-hr court notice? Call 211 or Legal Aid Defense directly'. 

In the hero section, display an empathetic headline: 'Free, Safe Legal Help in Plain Language' with a subtitle: 'Demystify eviction notices, unpaid wages, and legal contracts without high attorney fees.' 

Provide a large, accessible prompt box: 'Describe what happened in your own words (e.g. My landlord gave me a 3-day notice, or my boss withheld overtime)...' with a microphone button and an upload notice button. Below the box, display 5 interactive category pill buttons: Tenancy & Evictions, Workplace & Wages, Debt Collection, Family & Custody, Civil Rights. Include a prominent 'Analyze My Rights Safely' button in electric indigo (#6366F1). To the right, show a live 'Security & Privacy Guarantee' card highlighting 100% Client PII Redaction and Zero-Retention ephemeral processing.
```

---

### Screen 2: Document Demystifier & Predatory Clause Scanner (`/analyze`)

#### Purpose
Enables users to upload or paste a lease, settlement offer, notice to vacate, or employment contract, returning a side-by-side translation into 6th-grade English with predatory clauses flagged in Red/Yellow.

#### Key Features & Components
1. **Drag-and-Drop Uploader:** Supports PDF, DOCX, and raw text pastes.
2. **Side-by-Side Split View:**
   - Left Pane: Original legal document with color-highlighted risk spans.
   - Right Pane: Plain-English translation cards with "What This Means For You".
3. **Predatory Clause Detector Card:** Highlights illegal clauses (e.g., *"Landlord may enter without 24hr notice"* flagged as unenforceable under state law).
4. **Loop Engineering Progress Bar:** Live indicator showing real-time agent loop:
   - `[✓] PII Stripped` -> `[✓] Legal Analysis` -> `[⚡] Senior Legal Critic Auditing (96/100)` -> `[✓] Verified Safe`.

#### Stitch MCP Generation Prompt
> **Stitch Command:** `generate_screen_from_text`
```text
Design a modern, high-precision Document Demystifier & Clause Scanner screen for a legal assistance app. Use a dark theme with slate surfaces (#1E293B) and sharp border outlines. 

The screen features a side-by-side two-column split layout:
The Left Column displays the 'Original Legal Document' with interactive highlighted clauses: red highlight for predatory/illegal clauses (e.g. waiver of habitability), amber for high-risk clauses (accelerated late fees), and green for standard terms. Above the text, show a sticky document summary badge: 'Residential Lease Agreement • 14 Pages • 3 Predatory Terms Found'.

The Right Column displays the 'Plain-English Rights Translation'. Show clean cards with 6th-grade readability: a badge 'What This Actually Means', a summary of your rights under state law, and an 'Actionable Defense' chip. 

Include a floating 'Closed-Loop Verification Badge' in the top right: 'Audited by LexisLoop Critic Agent: 98% Accuracy • Zero Hallucination • ABA Ethics Compliant'. Provide action buttons at the bottom: 'Draft Response Letter' and 'Find Free Legal Clinic'.
```

---

### Screen 3: Tenant & Worker Rights Interactive Navigator (`/rights`)

#### Purpose
Guides users through an interactive decision tree to determine if their landlord, employer, or debt collector has violated statutory protections.

#### Key Features & Components
1. **Guided Stepper:** Progressive 4-step wizard:
   - Step 1: Jurisdiction & Location (State / City).
   - Step 2: What Action Was Taken (Notice served, lock changed, wages withheld).
   - Step 3: Procedural Deficiencies (No written notice, retaliatory timing).
   - Step 4: Outcome & Rights Summary.
2. **Statutory Defense Card:** Displays verified state laws (e.g. *Cal. Civ. Code § 1942.5 - Unlawful Retaliation*).
3. **Deadline Countdown Widget:** Visual countdown showing remaining days to file an Answer in court.

#### Stitch MCP Generation Prompt
> **Stitch Command:** `generate_screen_from_text`
```text
Design an interactive Tenant & Worker Rights Navigator wizard for JurisAccess AI. The layout features a clean 4-step horizontal progress tracker at the top: '1. Jurisdiction & Issue', '2. Landlord/Employer Actions', '3. Notice Details', '4. Your Legal Rights'.

The central container is an elevated card displaying Step 2: 'Did your landlord follow proper legal procedure?'. Provide four large selectable cards with clear icons and toggle checkboxes:
1. 'Changed locks or shut off utilities' (Flagged with Red Badge: Criminal Misdemeanor in most states)
2. 'Served notice without stating reason' (Flagged: Possible Procedural Defect)
3. 'Gave less than statutory notice period' (e.g., 3 days instead of 30)
4. 'Raised rent immediately after a repair complaint' (Flagged: Presumptive Retaliation)

Below the cards, display a statutory guidance box: 'Under the Uniform Residential Landlord and Tenant Act (URLTA), self-help evictions are strictly prohibited.' Add 'Back' and 'Continue to Step 3' buttons in high-contrast indigo and slate.
```

---

### Screen 4: Free Legal Aid & Pro Bono Clinic Locator (`/aid`)

#### Purpose
Connects qualifying low-income citizens directly to verified Legal Services Corporation (LSC) organizations, voluntary bar associations, and tenant defense networks.

#### Key Features & Components
1. **ZIP Code & Income Pre-Screener:** Quick calculator comparing household income to the Federal Poverty Level (FPL <= 200%).
2. **Legal Aid Directory Cards:** Shows verified local clinics with address, distance, walk-in intake hours, and phone numbers.
3. **Document Checklist Generator:** Tells the user what documents to bring to their appointment (Lease copy, notice to quit, payment receipts, photos of defects).

#### Stitch MCP Generation Prompt
> **Stitch Command:** `generate_screen_from_text`
```text
Design a Free Legal Aid & Clinic Locator interface for low-income citizens. The top section contains a search bar with ZIP Code input and a quick income filter dropdown ('Household Size & Income'). 

Display an eligibility confirmation banner in emerald green (#10B981): 'You appear eligible for 100% Free Legal Representation under LSC Guidelines (Income <= 200% FPL).'

Below, display a 2-column grid of verified Legal Aid clinic cards:
Card 1: 'Neighborhood Legal Services Clinic' • 2.4 miles away • Walk-In Hours: Mon-Thu 9am-12pm • Practice Areas: Housing, Eviction Defense, Domestic Violence • Phone: (555) 019-3829 • Button: 'Get Directions & Call'.
Card 2: 'Volunteer Lawyers Project - Tenant Defense' • 4.1 miles away • Intake: Online / Phone • Direct Referral Available • Button: 'Submit Intake Referral'.

On the right sidebar, display a sticky 'Intake Checklist': 'Documents to bring to your appointment: 1. Written notice, 2. Lease agreement, 3. Proof of rent payments, 4. Photo evidence of conditions.'
```

---

### Screen 5: Pro Se Legal Letter & Notice Builder (`/action`)

#### Purpose
Generates formal, legally sound, and properly formatted demand letters that self-represented citizens can sign, send via certified mail, or submit to a landlord, employer, or small claims court.

#### Key Features & Components
1. **Letter Template Selector:**
   - *Formal Demand for Return of Security Deposit*
   - *Notice of Habitability Defect & Repair Demand*
   - *Wage Theft & Unpaid Overtime Demand*
   - *FDCPA Debt Validation & Cease-and-Desist Notice*
2. **Interactive Form Fields:** Pre-fills with detokenized user information (Landlord name, address, amount withheld, inspection date).
3. **Live Document Preview:** Real-time formal letter rendered with formal legal header, statutory citations, and signature line.
4. **Export Options:** One-click `Download PDF`, `Copy Plain Text`, and `Certified Mail Instructions Checklist`.

#### Stitch MCP Generation Prompt
> **Stitch Command:** `generate_screen_from_text`
```text
Design a Pro Se Legal Demand Letter Builder screen for JurisAccess AI. The screen features a split layout:
The Left Column has an interactive letter customization panel: Select Template ('Security Deposit Return Demand'), enter Landlord Name, Rental Address, Amount Withheld ($1,850), Date Tenancy Ended, and Statutory Grace Period (21 Days). Include a toggle for 'Include statutory penalty demand for bad-faith retention (Double/Treble damages)'.

The Right Column renders a realistic, crisp formal letter preview on an off-white paper canvas with dark legal typography:
- Header: Sender Info, Date, Landlord Address, Sent via Certified Mail #
- Re: Formal Demand for Return of Security Deposit under Civil Code § 1950.5
- Body: Professional, firm, legally grounded text demanding full refund within 10 days, citing failure to provide itemized deductions, and reservation of small claims rights.
- Signature line with date.

At the top of the preview, provide action buttons: 'Download Formatted PDF', 'Copy Letter Text', and 'Print Certified Mail Slip'.
```

---

## 4. Accessibility & Responsive Guidelines (WCAG 2.1 AAA)

1. **Color Contrast:** All body text must maintain a minimum contrast ratio of `7:1` against backgrounds. Interactive links and buttons must maintain `4.5:1` against adjacent elements.
2. **Keyboard Navigation:** Every interactive element (tabs, accordions, buttons, file uploaders) must support full `Tab`, `Shift+Tab`, `Enter`, and `Space` keyboard actuation with visible outline focus rings (`outline: 2px solid #6366F1`).
3. **Screen Reader Optimization:**
   - Dynamic changes (e.g. Critic Agent audit score updates, PII sanitization status) must use `aria-live="polite"` regions.
   - Emergency hotlines must use `role="alert"` for instant announcement upon page load.
4. **Flesch-Kincaid Plain Language:** All generated UI text and agent outputs must maintain a Flesch-Kincaid Reading Ease score of `>= 65.0` (accessible to adults reading at a 6th-to-7th grade level).

---

## 5. Cloudflare Pages Deployment

Deploy your frontend to Cloudflare Pages for instant global edge delivery:

### Option A: Cloudflare Git Integration (Automatic)
1. Push your repository to GitHub (`git push origin main`).
2. Open the **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages**.
3. Select `calmcode47/Legal-Assistance`.
4. Set Build Settings:
   - **Framework preset:** `None`
   - **Build command:** `None` (or your Stitch build script)
   - **Build output directory:** `public`
5. Click **Save and Deploy**. Cloudflare automatically configures global CDN caching, SSL, and applies the edge security headers defined in `public/_headers`.

### Option B: Cloudflare Wrangler CLI (Direct Deploy)
```bash
# Install or run Wrangler directly
npx wrangler pages deploy public --project-name=jurisaccess-frontend
```

### Pointing to the Render Backend
In `public/app.js` or via environment variable in Cloudflare Pages dashboard:
```javascript
window.RENDER_BACKEND_URL = "https://your-backend-app.onrender.com/api";
```
