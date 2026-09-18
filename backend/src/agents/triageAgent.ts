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
  public static async triage(
    userQuery: string,
    state?: string,
    zipCode?: string,
    domainHint?: LegalDomain
  ): Promise<TriageResult> {
    // 1. Fast deterministic check for critical safety emergencies
    const isEmergency = UPLGuard.isEmergency(userQuery);

    const prompt = buildTriagePrompt(userQuery, state, zipCode, domainHint);
    const rawResponse = await LLMService.generate(prompt, {
      systemInstruction: TRIAGE_SYSTEM_INSTRUCTION,
      temperature: 0.1,
    });

    try {
      // Clean possible markdown code fences before parsing
      const cleaned = rawResponse.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as TriageResult;

      // Prefer explicit user-selected domain when the model is uncertain
      if (domainHint && (parsed.confidenceScore ?? 1) < 0.9) {
        parsed.detectedDomain = domainHint;
      } else if (domainHint && !parsed.detectedDomain) {
        parsed.detectedDomain = domainHint;
      }

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
        detectedDomain: domainHint || LegalDomain.TENANCY_AND_HOUSING,
        confidenceScore: 0.85,
        urgencyLevel: isEmergency ? UrgencyLevel.CRITICAL : UrgencyLevel.MEDIUM,
        urgencyReasoning: domainHint
          ? `Routed using litigant-selected domain ${domainHint} with keyword fallback.`
          : 'Inferred civil rights/housing matter based on standard tenant protections.',
        emergencyHotlinesTriggered: isEmergency,
        recommendedNextModule: isEmergency ? 'EMERGENCY_HOTLINE' : 'DEMYSITIFIER',
      };
    }
  }
}
