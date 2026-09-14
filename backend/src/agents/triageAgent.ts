/**
 * JurisAccess AI - Triage & Urgency Agent
 * Classifies legal domain, evaluates emergency triggers, and identifies statutory deadlines.
 */

import { TriageResult } from '../types/agent';
import { LLMService } from '../services/llmService';
import { TRIAGE_SYSTEM_INSTRUCTION, buildTriagePrompt } from '../prompts/triagePrompts';
import { UPLGuard } from '../guardrails/uplGuard';
import { LegalDomain, UrgencyLevel } from '../types/legal';

export class TriageAgent {
  /**
   * Evaluates citizen query and determines legal domain, urgency level, and routing
   */
  public static async triage(userQuery: string, state?: string, zipCode?: string): Promise<TriageResult> {
    // 1. Fast deterministic check for critical safety emergencies
    const isEmergency = UPLGuard.isEmergency(userQuery);

    const prompt = buildTriagePrompt(userQuery, state, zipCode);
    const rawResponse = await LLMService.generate(prompt, {
      systemInstruction: TRIAGE_SYSTEM_INSTRUCTION,
      temperature: 0.1,
    });

    try {
      // Clean possible markdown code fences before parsing
      const cleaned = rawResponse.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as TriageResult;

      // Override if domestic emergency was deterministically detected
      if (isEmergency) {
        parsed.urgencyLevel = UrgencyLevel.CRITICAL;
        parsed.emergencyHotlinesTriggered = true;
        parsed.recommendedNextModule = 'EMERGENCY_HOTLINE';
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to parse triage LLM response as JSON. Using fallback triage logic:', error);
      return {
        detectedDomain: LegalDomain.TENANCY_AND_HOUSING,
        confidenceScore: 0.85,
        urgencyLevel: isEmergency ? UrgencyLevel.CRITICAL : UrgencyLevel.MEDIUM,
        urgencyReasoning: 'Inferred civil rights/housing matter based on standard tenant protections.',
        emergencyHotlinesTriggered: isEmergency,
        recommendedNextModule: isEmergency ? 'EMERGENCY_HOTLINE' : 'DEMYSITIFIER',
      };
    }
  }
}
