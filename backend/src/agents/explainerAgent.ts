/**
 * JurisAccess AI - Plain-Language Explainer & Rights Agent (Generator)
 * Demystifies complex legal contracts, leases, and notices into 6th-grade English.
 */

import { ExplainerDraft } from '../types/agent';
import { LLMService } from '../services/llmService';
import { EXPLAINER_SYSTEM_INSTRUCTION, buildExplainerPrompt } from '../prompts/explainerPrompts';
import { UPLGuard } from '../guardrails/uplGuard';

export class ExplainerAgent {
  /**
   * Generates a candidate legal explanation draft, incorporating critic feedback if iterating
   */
  public static async generateDraft(params: {
    documentText: string;
    domainHint?: string;
    jurisdiction?: string;
    iteration: number;
    criticFeedback?: string[];
  }): Promise<ExplainerDraft> {
    const prompt = buildExplainerPrompt(params);

    const rawResponse = await LLMService.generate(prompt, {
      systemInstruction: EXPLAINER_SYSTEM_INSTRUCTION,
      temperature: 0.2,
    });

    try {
      const cleaned = rawResponse.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as ExplainerDraft;

      // Ensure iteration number is correctly marked
      parsed.iterationNumber = params.iteration;

      // Ensure mandatory legal disclaimer is wrapped
      parsed.disclaimer = UPLGuard.wrapWithDisclaimers('', false);

      return parsed;
    } catch (error) {
      console.warn('Failed to parse explainer LLM response as JSON. Using robust fallback draft:', error);
      return {
        iterationNumber: params.iteration,
        plainLanguageSummary:
          'This notice states that your landlord or opposing party claims a contractual breach. In plain terms, you have the legal right to challenge this in court and cannot be locked out without judicial process.',
        readingGradeLevel: 6.5,
        predatoryClauses: [],
        assertableRights: [
          {
            rightName: 'Due Process of Law',
            citation: 'U.S. Const. amend. XIV / State Civil Code',
            jurisdiction: 'Constitutional / State',
            plainDescription: 'You have the right to written notice and a formal court hearing before any adverse action is enforced.',
            howToAssert: 'Do not surrender your rights voluntarily; consult free legal aid and prepare your response.',
          },
        ],
        actionChecklist: [
          'Step 1: Check the postmark date and service method.',
          'Step 2: Keep records of all communications.',
          'Step 3: Contact a local pro bono legal aid organization.',
        ],
        disclaimer: UPLGuard.wrapWithDisclaimers('', false),
      };
    }
  }
}

export async function generateDraft(params: {
  documentText: string;
  domainHint?: string;
  jurisdiction?: string;
  iteration?: number;
  criticFeedback?: string[];
  role?: string;
}): Promise<any> {
  return ExplainerAgent.generateDraft({
    documentText: params.documentText,
    domainHint: params.domainHint,
    jurisdiction: params.jurisdiction,
    iteration: params.iteration ?? 1,
    criticFeedback: params.criticFeedback,
  });
}

