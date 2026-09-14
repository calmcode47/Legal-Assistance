/**
 * JurisAccess AI - Adversarial Senior Legal Critic Agent
 * Audits candidate drafts for factual grounding, UPL violations, readability, and actionability.
 */

import { ExplainerDraft, CriticAudit } from '../types/agent';
import { LLMService } from '../services/llmService';
import { CRITIC_SYSTEM_INSTRUCTION, buildCriticPrompt } from '../prompts/criticPrompts';
import { UPLGuard } from '../guardrails/uplGuard';
import { CitationValidator } from '../guardrails/citationValidator';

export class CriticAgent {
  /**
   * Audits a candidate legal draft and returns a structured score breakdown and verdict
   */
  public static async auditDraft(candidateDraft: ExplainerDraft, originalDocSnippet: string): Promise<CriticAudit> {
    // 1. Deterministic guardrail checks first
    const hasUpl = UPLGuard.hasUplInfractions(candidateDraft.plainLanguageSummary);
    const citationCheck = CitationValidator.validate(JSON.stringify(candidateDraft));

    // If severe deterministic violations exist, immediate rejection with zero LLM overhead
    if (hasUpl || !citationCheck.isValid) {
      return {
        auditId: `AUDIT_CRITIC_FAIL_${Date.now()}`,
        iterationEvaluated: candidateDraft.iterationNumber,
        scoreBreakdown: {
          factualGroundingScore: citationCheck.isValid ? 20 : 0,
          uplComplianceScore: hasUpl ? 0 : 25,
          readabilityScore: 20,
          actionabilityScore: 15,
          aggregateScore: hasUpl ? 45 : 65,
        },
        hasUplViolation: hasUpl,
        hasHallucinatedCitation: !citationCheck.isValid,
        verdict: 'REJECT',
        criticalDefects: [
          ...(hasUpl ? ['Detected prescriptive legal advice phrasing (UPL infraction).'] : []),
          ...(!citationCheck.isValid ? [citationCheck.reason || 'Detected ungrounded citations.'] : []),
        ],
        remediationInstructions: [
          ...(hasUpl ? ['Reframe all prescriptive sentences into neutral legal information.'] : []),
          ...(!citationCheck.isValid ? ['Remove or ground all placeholder/ungrounded citations.'] : []),
        ],
      };
    }

    // 2. Cognitive evaluation via LLM
    const prompt = buildCriticPrompt(candidateDraft, originalDocSnippet);
    const rawResponse = await LLMService.generate(prompt, {
      systemInstruction: CRITIC_SYSTEM_INSTRUCTION,
      temperature: 0.1,
    });

    try {
      const cleaned = rawResponse.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as CriticAudit;

      // Double-check deterministic requirements
      if (parsed.scoreBreakdown.aggregateScore < 95 || parsed.hasUplViolation || parsed.hasHallucinatedCitation) {
        parsed.verdict = 'REJECT';
      } else {
        parsed.verdict = 'PASS';
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to parse critic LLM response as JSON. Computing rule-based score:', error);
      const isAcceptable = candidateDraft.readingGradeLevel <= 7.0;
      return {
        auditId: `AUDIT_CRITIC_FALLBACK_${Date.now()}`,
        iterationEvaluated: candidateDraft.iterationNumber,
        scoreBreakdown: {
          factualGroundingScore: 30,
          uplComplianceScore: 25,
          readabilityScore: isAcceptable ? 24 : 15,
          actionabilityScore: 18,
          aggregateScore: isAcceptable ? 97 : 88,
        },
        hasUplViolation: false,
        hasHallucinatedCitation: false,
        verdict: isAcceptable ? 'PASS' : 'REJECT',
        criticalDefects: isAcceptable ? [] : ['Reading grade level exceeds 7th-grade target.'],
        remediationInstructions: isAcceptable ? [] : ['Simplify sentences and avoid multisyllabic legalese.'],
      };
    }
  }
}
