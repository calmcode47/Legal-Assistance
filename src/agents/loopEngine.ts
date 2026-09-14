/**
 * JurisAccess AI - Loop Engineering Engine (The Closed-Loop Cognitive Orchestrator)
 * Orchestrates Generator-Critic-Refiner loops, two-way PII tokenization, and statutory grounding.
 */

import crypto from 'crypto';
import { PIIScrubber } from '../guardrails/piiScrubber';
import { InjectionGuard } from '../guardrails/injectionGuard';
import { TriageAgent } from './triageAgent';
import { ExplainerAgent } from './explainerAgent';
import { CriticAgent } from './criticAgent';
import { MatcherAgent } from './matcherAgent';
import { LoopExecutionReceipt, ExplainerDraft } from '../types/agent';
import { LegalDomain } from '../types/legal';

export interface LoopExecutionOptions {
  documentText: string;
  domainHint?: LegalDomain;
  jurisdiction?: string;
  state?: string;
  zipCode?: string;
  maxIterations?: number;
}

export class LoopEngine {
  /**
   * Executes the full 5-stage cognitive loop with closed-loop self-correction
   */
  public static async execute(options: LoopExecutionOptions): Promise<LoopExecutionReceipt> {
    const startTime = Date.now();
    const sessionId = `LEXIS_LOOP_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const maxIterations = Math.min(options.maxIterations ?? 3, 3);

    // -------------------------------------------------------------
    // STAGE 1: Adversarial Guardrail & Delimiter Sandboxing
    // -------------------------------------------------------------
    const scanResult = InjectionGuard.scan(options.documentText);
    if (!scanResult.isSafe) {
      throw new Error(`Security Violation: ${scanResult.detectedThreat}`);
    }

    // -------------------------------------------------------------
    // STAGE 2: Pre-Inference PII Sanitization
    // -------------------------------------------------------------
    const { sanitizedText, tokenMap } = PIIScrubber.sanitize(options.documentText);

    // -------------------------------------------------------------
    // STAGE 3: Triage & Urgency Evaluation
    // -------------------------------------------------------------
    const triage = await TriageAgent.triage(sanitizedText, options.state, options.zipCode);

    // -------------------------------------------------------------
    // STAGE 4: Generator-Critic Closed Feedback Loop
    // -------------------------------------------------------------
    let currentIteration = 1;
    let converged = false;
    let finalAuditScore = 0;
    let candidateDraft: ExplainerDraft | null = null;
    let criticFeedback: string[] = [];

    while (currentIteration <= maxIterations && !converged) {
      // 4a. Generator Agent drafts or refines analysis
      candidateDraft = await ExplainerAgent.generateDraft({
        documentText: sanitizedText,
        domainHint: options.domainHint || triage.detectedDomain,
        jurisdiction: options.jurisdiction,
        iteration: currentIteration,
        criticFeedback: criticFeedback.length > 0 ? criticFeedback : undefined,
      });

      // 4b. Critic Agent audits candidate draft
      const audit = await CriticAgent.auditDraft(candidateDraft, sanitizedText);
      finalAuditScore = audit.scoreBreakdown.aggregateScore;

      // 4c. Evaluate Convergence Condition
      if (audit.verdict === 'PASS' && finalAuditScore >= 95 && !audit.hasUplViolation && !audit.hasHallucinatedCitation) {
        converged = true;
      } else {
        // Collect delta feedback for the next iteration
        criticFeedback = audit.remediationInstructions;
        currentIteration++;
      }
    }

    // Fallback if loop reached max iterations without full convergence
    if (!candidateDraft) {
      throw new Error('Loop failed to generate a candidate draft.');
    }

    // -------------------------------------------------------------
    // STAGE 5: Egress PII De-tokenization & Legal Aid Matching
    // -------------------------------------------------------------
    // De-tokenize the plain language summary and action checklist
    candidateDraft.plainLanguageSummary = PIIScrubber.detokenize(candidateDraft.plainLanguageSummary, tokenMap);
    candidateDraft.actionChecklist = (candidateDraft.actionChecklist || []).map((step) =>
      PIIScrubber.detokenize(step, tokenMap)
    );

    // Match local pro bono legal clinics
    const { clinics } = await MatcherAgent.match({
      zipCode: options.zipCode || '90012',
      state: options.state || 'CA',
      domain: triage.detectedDomain,
    });

    const executionTimeMs = Date.now() - startTime;

    return {
      sessionId,
      totalIterations: converged ? currentIteration : maxIterations,
      converged,
      finalAuditScore,
      triage,
      verifiedAnalysis: candidateDraft,
      recommendedClinics: clinics,
      executionTimeMs,
      timestamp: new Date().toISOString(),
    };
  }
}
