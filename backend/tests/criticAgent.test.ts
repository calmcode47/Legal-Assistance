/**
 * JurisAccess AI - Senior Legal Critic Agent Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { CriticAgent } from '../src/agents/criticAgent';
import { ExplainerDraft } from '../src/types/agent';
import { ClauseRiskTier } from '../src/types/legal';

describe('CriticAgent Adversarial Audit Engine', () => {
  const baseDraft: ExplainerDraft = {
    iterationNumber: 1,
    plainLanguageSummary: 'The landlord demands rent within 3 days or requires you to vacate. You have procedural rights under state law.',
    readingGradeLevel: 6.2,
    predatoryClauses: [
      {
        clauseId: 'C1',
        originalText: 'Tenant waives all rights to notice.',
        plainMeaning: 'Attempting to enter without warning.',
        riskTier: ClauseRiskTier.RED_PREDATORY,
        statutoryDefect: 'Void against public policy under Civil Code § 1954.',
        recommendedAction: 'Demand statutory 24-hour notice.',
      },
    ],
    assertableRights: [
      {
        rightName: 'Habitability Protection',
        citation: 'URLTA § 2.104',
        jurisdiction: 'State Civil Code',
        plainDescription: 'Landlords must provide working heat and plumbing.',
        howToAssert: 'Document defects with dated photos.',
      },
    ],
    actionChecklist: ['Check notice date.', 'Contact local legal aid.'],
    disclaimer: 'JurisAccess AI is an automated educational tool.',
  };

  it('audits a legally grounded draft and issues PASS verdict with score >= 95', async () => {
    const audit = await CriticAgent.auditDraft(baseDraft, 'Original notice snippet');
    expect(audit.auditId).toBeDefined();
    expect(audit.hasUplViolation).toBe(false);
    expect(audit.hasHallucinatedCitation).toBe(false);
    expect(audit.scoreBreakdown.aggregateScore).toBeGreaterThanOrEqual(95);
    expect(audit.verdict).toBe('PASS');
  });

  it('immediately rejects drafts containing UPL violations with zero LLM overhead', async () => {
    const uplDraft: ExplainerDraft = {
      ...baseDraft,
      plainLanguageSummary: 'I advise you to sue your landlord immediately as your attorney.',
    };

    const audit = await CriticAgent.auditDraft(uplDraft, 'Original snippet');
    expect(audit.verdict).toBe('REJECT');
    expect(audit.hasUplViolation).toBe(true);
    expect(audit.criticalDefects).toContain('Detected prescriptive legal advice phrasing (UPL infraction).');
    expect(audit.scoreBreakdown.uplComplianceScore).toBe(0);
  });

  it('immediately rejects drafts containing hallucinated citation placeholders', async () => {
    const hallucinatedDraft: ExplainerDraft = {
      ...baseDraft,
      assertableRights: [
        {
          rightName: 'Unknown Right',
          citation: 'Pursuant to [citation needed]',
          jurisdiction: 'Unknown',
          plainDescription: 'Unknown',
          howToAssert: 'Unknown',
        },
      ],
    };

    const audit = await CriticAgent.auditDraft(hallucinatedDraft, 'Original snippet');
    expect(audit.verdict).toBe('REJECT');
    expect(audit.hasHallucinatedCitation).toBe(true);
  });
});
