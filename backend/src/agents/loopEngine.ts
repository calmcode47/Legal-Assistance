/**
 * JurisAccess AI - Loop Engineering Engine (The Closed-Loop Cognitive Orchestrator)
 * Orchestrates Generator-Critic-Refiner loops, two-way PII tokenization, and statutory grounding.
 */

import crypto from 'crypto';
import { PIIScrubber } from '../guardrails/piiScrubber';
import { InjectionGuard } from '../guardrails/injectionGuard';
import { TriageAgent } from './triageAgent';
import * as explainerAgent from './explainerAgent';
import * as criticAgent from './criticAgent';
import { MatcherAgent } from './matcherAgent';
import { LoopExecutionReceipt, ExplainerDraft } from '../types/agent';
import { LegalDomain } from '../types/legal';

export const MAX_ITERATIONS = 3;
export const CONVERGENCE_THRESHOLD = 95;

export interface LoopExecutionOptions {
  documentText: string;
  role?: string;
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
    const maxIterations = Math.min(options.maxIterations ?? MAX_ITERATIONS, MAX_ITERATIONS);

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
    let lastFeedback = '';
    let lastScore = 0;
    let lastDraft: ExplainerDraft | null = null;
    let converged = false;
    let iterationsExecuted = 0;

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      iterationsExecuted = iteration;

      // 4a. Generator Agent produces candidate draft
      const draft = await explainerAgent.generateDraft({
        documentText: sanitizedText,
        role: options.role,
        domainHint: options.domainHint || triage.detectedDomain,
        jurisdiction: options.jurisdiction,
        iteration,
        criticFeedback: lastFeedback ? [lastFeedback] : undefined,
      });
      lastDraft = draft;

      // 4b. Critic Agent audits candidate draft
      const audit = await criticAgent.auditDraft(draft, sanitizedText);

      // Normalize audit score and verdicts (supporting both raw CriticAudit and test mocks)
      const auditScore = audit.score ?? audit.scoreBreakdown?.aggregateScore ?? 0;
      const isApproved = audit.approved ?? (audit.verdict === 'PASS');
      const hasUpl = (audit.uplViolations && audit.uplViolations.length > 0) || Boolean(audit.hasUplViolation);
      const hasHallucination = Boolean(audit.hasHallucinatedCitation);
      const feedbackMsg = audit.feedback ?? (audit.remediationInstructions?.join(' ') || '');

      lastScore = auditScore;
      lastFeedback = feedbackMsg;

      // 4c. Evaluate Convergence Condition
      if (isApproved && auditScore >= CONVERGENCE_THRESHOLD && !hasUpl && !hasHallucination) {
        converged = true;
        break;
      }
      // Not approved — loop again with critic's feedback. Do NOT return early on a rejected draft.
    }

    // Match local pro bono legal clinics (Stage 5)
    const { clinics } = await MatcherAgent.match({
      zipCode: options.zipCode || '90012',
      state: options.state || 'CA',
      domain: triage.detectedDomain,
    });

    const executionTimeMs = Date.now() - startTime;

    // -------------------------------------------------------------
    // STAGE 5: Egress Formatting & Safe Fallback Handling
    // -------------------------------------------------------------
    if (converged && lastDraft) {
      const draftRecord = lastDraft as ExplainerDraft & { plainLanguage?: string; clauses?: ExplainerDraft['predatoryClauses'] };
      const rawSummary = draftRecord.plainLanguage ?? lastDraft.plainLanguageSummary ?? '';
      const detokenizedSummary = PIIScrubber.detokenize(rawSummary, tokenMap);
      const detokenizedChecklist = (lastDraft.actionChecklist || []).map((step) =>
        PIIScrubber.detokenize(step, tokenMap)
      );

      const verifiedAnalysis: ExplainerDraft = {
        iterationNumber: iterationsExecuted,
        plainLanguageSummary: detokenizedSummary,
        readingGradeLevel: lastDraft.readingGradeLevel ?? 6.5,
        predatoryClauses: lastDraft.predatoryClauses ?? draftRecord.clauses ?? [],
        assertableRights: lastDraft.assertableRights ?? [],
        actionChecklist: detokenizedChecklist,
        disclaimer: lastDraft.disclaimer ?? '',
      };

      return {
        sessionId,
        totalIterations: iterationsExecuted,
        iterations: iterationsExecuted,
        converged: true,
        status: 'converged',
        finalAuditScore: lastScore,
        score: lastScore,
        triage,
        verifiedAnalysis,
        output: {
          plainLanguage: detokenizedSummary,
          clauses: verifiedAnalysis.predatoryClauses,
        },
        lastCriticFeedback: lastFeedback,
        recommendedClinics: clinics,
        executionTimeMs,
        timestamp: new Date().toISOString(),
      };
    }

    // Exhausted MAX_ITERATIONS without convergence.
    // Deliberately do NOT return the unverified draft as verified legal guidance.
    return {
      sessionId,
      totalIterations: maxIterations,
      iterations: maxIterations,
      converged: false,
      status: 'unresolved',
      finalAuditScore: lastScore,
      score: lastScore,
      triage,
      output: {
        plainLanguage: '',
        clauses: [],
      },
      verifiedAnalysis: {
        iterationNumber: maxIterations,
        plainLanguageSummary: '',
        readingGradeLevel: 6.0,
        predatoryClauses: [],
        assertableRights: [],
        actionChecklist: [
          '1. Contact your local Legal Services Corporation (LSC) partner clinic for pro bono review.',
          '2. Use the Document Demystifier for a new review when you have more document text.',
          '3. Retain complete physical and digital copies of all legal notices and summons.',
        ],
        disclaimer:
          'This document could not be verified to our accuracy standard after multiple review passes. ' +
          'We are not showing an unverified analysis. Please consult a licensed attorney or a free legal aid clinic.',
      },
      lastCriticFeedback: lastFeedback,
      safeFallback: {
        disclaimer:
          'This document could not be verified to our accuracy standard after multiple review passes. ' +
          'We are not showing an unverified analysis. Please consult a licensed attorney or a free legal aid clinic.',
        generalEducationalInfo:
          'General educational information is available through the Document Demystifier and Legal Aid Locator modules.',
        recommendedAction:
          'Use the Legal Aid Locator to find a clinic, or return to the Document Demystifier with more document text.',
      },
      recommendedClinics: clinics,
      executionTimeMs,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Top-level function export for executeLoop
 */
export async function executeLoop(options: LoopExecutionOptions): Promise<LoopExecutionReceipt> {
  return LoopEngine.execute(options);
}
