/**
 * JurisAccess AI - Matcher Agent Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { MatcherAgent } from '../src/agents/matcherAgent';
import { LegalDomain } from '../src/types/legal';

describe('MatcherAgent Pro Bono Clinic & Intake Checklist Engine', () => {
  it('matches verified LSC legal aid organizations by ZIP and domain', async () => {
    const result = await MatcherAgent.match({
      zipCode: '90012',
      state: 'CA',
      domain: LegalDomain.TENANCY_AND_HOUSING,
      annualHouseholdIncome: 24000,
      householdSize: 3,
    });

    expect(result.clinics).toBeDefined();
    expect(result.clinics.length).toBeGreaterThan(0);
    expect(result.clinics.some((c) => c.isLscFunded)).toBe(true);
    expect(result.clinics.some((c) => c.state === 'CA' || c.state === 'US')).toBe(true);
  });

  it('generates a structured intake checklist when user situation is provided', async () => {
    const result = await MatcherAgent.match({
      zipCode: '90012',
      state: 'CA',
      domain: LegalDomain.TENANCY_AND_HOUSING,
      userSituation: 'Received a 3-day notice to pay rent or quit for $1,850 due to broken pipes.',
    });

    expect(result.intakeChecklist).toBeDefined();
    expect(result.intakeChecklist?.recommendedDocuments.length).toBeGreaterThan(0);
    expect(result.intakeChecklist?.intakeQuestionsToExpect.length).toBeGreaterThan(0);
    expect(result.intakeChecklist?.urgencyNote).toBeDefined();
  });
});
