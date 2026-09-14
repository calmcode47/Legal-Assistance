/**
 * JurisAccess AI - Legal Aid Matcher Agent
 * Identifies local pro bono clinics and prepares client intake checklists.
 */

import { LegalDomain, LegalAidClinic } from '../types/legal';
import { LegalAidService } from '../services/legalAidService';
import { LLMService } from '../services/llmService';
import { LEGAL_AID_MATCHER_INSTRUCTION, buildLegalAidIntakePrompt } from '../prompts/legalAidPrompts';

export interface IntakeChecklistResult {
  eligibilityOverview: string;
  recommendedDocuments: string[];
  intakeQuestionsToExpect: string[];
  urgencyNote: string;
}

export class MatcherAgent {
  /**
   * Matches verified legal aid clinics and generates an appointment intake checklist
   */
  public static async match(params: {
    zipCode: string;
    state: string;
    domain?: LegalDomain;
    annualHouseholdIncome?: number;
    householdSize?: number;
    userSituation?: string;
  }): Promise<{ clinics: LegalAidClinic[]; intakeChecklist?: IntakeChecklistResult }> {
    const clinics = LegalAidService.findClinics(params);

    let intakeChecklist: IntakeChecklistResult | undefined;

    if (params.userSituation) {
      const prompt = buildLegalAidIntakePrompt(params.domain || 'Civil Legal Help', params.userSituation);
      try {
        const raw = await LLMService.generate(prompt, {
          systemInstruction: LEGAL_AID_MATCHER_INSTRUCTION,
          temperature: 0.2,
        });
        const cleaned = raw.replace(/```json\s*|```/g, '').trim();
        intakeChecklist = JSON.parse(cleaned) as IntakeChecklistResult;
      } catch (e) {
        console.warn('Failed to parse intake checklist JSON:', e);
        intakeChecklist = {
          eligibilityOverview: 'Under LSC guidelines, free legal aid is generally available for households earning up to 125%-200% of the Federal Poverty Level.',
          recommendedDocuments: [
            'Proof of monthly household income (paystubs, tax return, or benefits letter)',
            'The written notice, lease, or summons received',
            'Any payment receipts or written correspondence with the opposing party',
          ],
          intakeQuestionsToExpect: [
            'What date did you receive the notice?',
            'What is the total amount claimed or disputed?',
          ],
          urgencyNote: 'Contact the clinic as early as possible on intake days, as walk-in slots fill quickly.',
        };
      }
    }

    return { clinics, intakeChecklist };
  }
}
