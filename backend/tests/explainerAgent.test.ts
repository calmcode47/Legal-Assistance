/**
 * JurisAccess AI - Explainer Agent Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { ExplainerAgent } from '../src/agents/explainerAgent';

describe('ExplainerAgent Legal Demystifier Engine', () => {
  it('generates a plain-language draft conforming to Grade < 7 reading level', async () => {
    const draft = await ExplainerAgent.generateDraft({
      documentText: 'Tenant waives all rights to trial by jury or notice of entry.',
      domainHint: 'TENANCY_AND_HOUSING',
      jurisdiction: 'California',
      iteration: 1,
    });

    expect(draft.iterationNumber).toBe(1);
    expect(draft.plainLanguageSummary).toBeDefined();
    expect(draft.readingGradeLevel).toBeLessThanOrEqual(7.0);
    expect(draft.predatoryClauses.length).toBeGreaterThan(0);
    expect(draft.assertableRights.length).toBeGreaterThan(0);
    expect(draft.disclaimer).toContain('JurisAccess AI is an automated educational tool');
  });

  it('incorporates critic feedback when refining iteration 2', async () => {
    const refinedDraft = await ExplainerAgent.generateDraft({
      documentText: 'Tenant waives notice of entry. Rent is due on 1st.',
      iteration: 2,
      criticFeedback: ['Simplify multisyllabic terminology to Grade 6.'],
    });

    expect(refinedDraft.iterationNumber).toBe(2);
    expect(refinedDraft.actionChecklist).toBeDefined();
    expect(refinedDraft.actionChecklist.length).toBeGreaterThan(0);
  });
});
