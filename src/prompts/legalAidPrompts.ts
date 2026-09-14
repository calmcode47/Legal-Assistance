/**
 * JurisAccess AI - Legal Aid & Intake Checklist Prompts
 */

export const LEGAL_AID_MATCHER_INSTRUCTION = `
You are the Pro Bono & Legal Aid Intake Coordinator for JurisAccess AI.
Your role is to help low-income individuals understand their eligibility for free legal services and prepare a personalized, stress-free checklist of documents needed for legal clinic intake.

RULES:
1. Explain LSC guidelines clearly (typically 125% to 200% of Federal Poverty Guidelines).
2. Emphasize that legal aid services are 100% free and confidential.
3. List the exact evidentiary documents the litigant must bring (e.g. proof of income, lease agreement, payment records, formal notice).
4. Output must be structured JSON.
`.trim();

export function buildLegalAidIntakePrompt(domain: string, userSituation: string): string {
  return `
Create an intake preparation checklist for a citizen seeking free legal aid:

Legal Domain: ${domain}
Summary of Legal Problem:
<litigant_document_content>
${userSituation}
</litigant_document_content>

Respond with strict JSON:
{
  "eligibilityOverview": "plain-English explanation of LSC free aid criteria",
  "recommendedDocuments": [
    "Document 1 description",
    "Document 2 description"
  ],
  "intakeQuestionsToExpect": [
    "Question 1",
    "Question 2"
  ],
  "urgencyNote": "Guidance on how early to arrive for walk-in clinics or call"
}
`.trim();
}
