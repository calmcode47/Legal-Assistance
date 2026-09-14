/**
 * JurisAccess AI - Plain-Language Explainer & Rights Extractor Prompts
 */

export const EXPLAINER_SYSTEM_INSTRUCTION = `
You are the Plain-Language Legal Explainer Agent for JurisAccess AI.
Your purpose is to empower self-represented citizens by translating complex legal contracts, eviction notices, and debt letters into 6th-grade reading-level English.

CORE RULES:
1. Target Readability: Keep sentences short and vocabulary accessible (Flesch-Kincaid Grade <= 7.0). Explain legal terms simply (e.g. instead of 'indemnify', explain 'you would have to pay their costs').
2. Flag Predatory Terms: Identify unconscionable clauses (e.g. waiving 24-hr notice of entry, waiving jury trial, illegal penalty fees) and rate them RED_PREDATORY, AMBER_UNFAVORABLE, or GREEN_STANDARD.
3. Extract Concrete Rights: Reference legitimate statutory principles (e.g. Warranty of Habitability, FDCPA validation right, FLSA overtime mandate). DO NOT invent fake court case names or fictitious docket numbers.
4. Action Checklist: Provide a chronological, actionable list of steps the litigant should take (e.g. gather receipts, send certified letter, file answer).
5. UPL Boundary: Provide legal INFORMATION and procedural guidance, NEVER prescriptive advice ('You must testify', 'I advise you').
6. Incorporate Feedback: If critic remediation instructions are provided, you MUST address every single defect in the revision.
`.trim();

export function buildExplainerPrompt(params: {
  documentText: string;
  domainHint?: string;
  jurisdiction?: string;
  iteration: number;
  criticFeedback?: string[];
}): string {
  const { documentText, domainHint, jurisdiction, iteration, criticFeedback } = params;

  let feedbackSection = '';
  if (criticFeedback && criticFeedback.length > 0) {
    feedbackSection = `
CRITIC REMEDIATION INSTRUCTIONS (You MUST resolve these in this draft):
${criticFeedback.map((f, idx) => `${idx + 1}. ${f}`).join('\n')}
    `.trim();
  }

  return `
Demystify this legal document for an everyday citizen:

Domain: ${domainHint || 'Civil Legal Dispute'}
Jurisdiction: ${jurisdiction || 'General US'}
Current Iteration: ${iteration}
${feedbackSection ? `\n${feedbackSection}\n` : ''}

<litigant_document_content>
${documentText}
</litigant_document_content>

Respond with strict JSON in this exact structure:
{
  "iterationNumber": ${iteration},
  "plainLanguageSummary": "Clear 6th-grade summary of what this document is and what is happening",
  "readingGradeLevel": number (e.g. 6.4),
  "predatoryClauses": [
    {
      "clauseId": "string (e.g. CLAUSE-01)",
      "originalText": "exact or summarized excerpt",
      "plainMeaning": "what it means in plain English",
      "riskTier": "RED_PREDATORY" | "AMBER_UNFAVORABLE" | "GREEN_STANDARD",
      "statutoryDefect": "why this clause is unfair or void under law",
      "recommendedAction": "practical step for the citizen"
    }
  ],
  "assertableRights": [
    {
      "rightName": "name of statutory right",
      "citation": "statutory reference (e.g. URLTA § 2.104 or state code)",
      "jurisdiction": "state or federal",
      "plainDescription": "what protection this gives the citizen",
      "howToAssert": "how to assert it (e.g. certified demand letter)"
    }
  ],
  "actionChecklist": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "disclaimer": "Notice: JurisAccess AI is an automated educational tool designed to assist self-represented litigants. It does not provide formal legal counsel or create an attorney-client relationship."
}
`.trim();
}
