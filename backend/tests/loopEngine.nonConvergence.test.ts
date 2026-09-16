/**
 * loopEngine.nonConvergence.test.ts
 *
 * Tests the non-convergence path:
 * When the Critic Agent rejects on every single iteration all the way to MAX_ITERATIONS,
 * the LoopEngine must terminate deterministically and return a clearly-labeled,
 * non-fabricated safe fallback — never throw an unhandled error, never loop past MAX_ITERATIONS,
 * and never silently return the last (rejected) draft as if it had passed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeLoop, MAX_ITERATIONS } from '../src/agents/loopEngine';
import * as criticAgent from '../src/agents/criticAgent';
import * as explainerAgent from '../src/agents/explainerAgent';

describe('loopEngine — non-convergence path', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('terminates at MAX_ITERATIONS instead of looping indefinitely when the Critic always rejects', async () => {
    // Explainer produces candidate drafts
    vi.spyOn(explainerAgent, 'generateDraft').mockResolvedValue({
      iterationNumber: 1,
      plainLanguageSummary: 'placeholder draft',
      plainLanguage: 'placeholder draft',
      readingGradeLevel: 6.5,
      predatoryClauses: [],
      clauses: [],
      assertableRights: [],
      actionChecklist: [],
      disclaimer: '',
    });

    // Critic rejects on every single call, regardless of iteration count.
    const criticSpy = vi.spyOn(criticAgent, 'auditDraft').mockResolvedValue({
      auditId: 'AUDIT_FAIL',
      iterationEvaluated: 1,
      score: 40, // well below the 95 convergence gate
      scoreBreakdown: {
        factualGroundingScore: 10,
        uplComplianceScore: 10,
        readabilityScore: 10,
        actionabilityScore: 10,
        aggregateScore: 40,
      },
      approved: false,
      verdict: 'REJECT',
      uplViolations: [],
      hasUplViolation: false,
      hasHallucinatedCitation: false,
      criticalDefects: ['Grounding insufficient'],
      remediationInstructions: ['Ground citations'],
      feedback: 'Statutory grounding insufficient — citation not found in source document.',
    });

    const result = await executeLoop({
      documentText: 'sample lease text for a test that should never converge',
      role: 'tenant',
      jurisdiction: 'US',
    });

    // 1. It must actually stop at MAX_ITERATIONS
    expect(criticSpy).toHaveBeenCalledTimes(MAX_ITERATIONS);

    // 2. It must report status: "unresolved" and converged: false
    expect(result.converged).toBe(false);
    expect(result.status).toBe('unresolved');

    // 3. It must not hand back the last rejected draft dressed up as a verified answer
    expect(result.output.plainLanguage).not.toContain('placeholder draft');
    expect(result.safeFallback).toBeDefined();
    expect(result.safeFallback?.disclaimer).toMatch(/could not (be )?verif/i);

    // 4. Evidence trail for debugging/audit
    expect(result.iterations).toBe(MAX_ITERATIONS);
    expect(result.lastCriticFeedback).toMatch(/grounding insufficient/i);
  });

  it('does not throw — a non-convergent result is a valid, handled outcome, not an error', async () => {
    vi.spyOn(explainerAgent, 'generateDraft').mockResolvedValue({
      iterationNumber: 1,
      plainLanguageSummary: 'placeholder draft',
      plainLanguage: 'placeholder draft',
      readingGradeLevel: 6.5,
      predatoryClauses: [],
      clauses: [],
      assertableRights: [],
      actionChecklist: [],
      disclaimer: '',
    });
    vi.spyOn(criticAgent, 'auditDraft').mockResolvedValue({
      auditId: 'AUDIT_FAIL',
      iterationEvaluated: 1,
      score: 10,
      scoreBreakdown: {
        factualGroundingScore: 0,
        uplComplianceScore: 0,
        readabilityScore: 5,
        actionabilityScore: 5,
        aggregateScore: 10,
      },
      approved: false,
      verdict: 'REJECT',
      uplViolations: ['prescriptive advice detected'],
      hasUplViolation: true,
      hasHallucinatedCitation: false,
      criticalDefects: ['UPL violation'],
      remediationInstructions: ['Reframe neutrally'],
      feedback: 'Contains prescriptive legal advice, not educational framing.',
    });

    await expect(
      executeLoop({
        documentText: 'adversarial input designed to never pass the critic',
        role: 'employee',
        jurisdiction: 'US',
      })
    ).resolves.toBeDefined();
  });
});
