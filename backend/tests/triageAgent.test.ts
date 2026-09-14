/**
 * JurisAccess AI - Triage Agent Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { TriageAgent } from '../src/agents/triageAgent';
import { LegalDomain, UrgencyLevel } from '../src/types/legal';

describe('TriageAgent', () => {
  it('should triage a 3-day eviction notice as CRITICAL Tenancy matter', async () => {
    const query = 'My landlord handed me a 3-day notice to pay rent or quit today and threatened sheriff lockout.';
    const result = await TriageAgent.triage(query, 'CA', '90012');

    expect(result.detectedDomain).toBe(LegalDomain.TENANCY_AND_HOUSING);
    expect(result.urgencyLevel).toBe(UrgencyLevel.CRITICAL);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.8);
    expect(result.emergencyHotlinesTriggered).toBe(true);
  });

  it('should triage unpaid overtime dispute as Employment matter', async () => {
    const query = 'My employer has withheld overtime pay and unpaid wages for the last 3 months.';
    const result = await TriageAgent.triage(query, 'NY', '10001');

    expect(result.detectedDomain).toBe(LegalDomain.EMPLOYMENT_AND_LABOR);
    expect(result.urgencyLevel).toBe(UrgencyLevel.HIGH);
  });

  it('should trigger emergency hotlines when domestic abuse keywords are detected', async () => {
    const emergencyQuery = 'My abusive partner threatened my life and locked me out of our apartment.';
    const result = await TriageAgent.triage(emergencyQuery);

    expect(result.urgencyLevel).toBe(UrgencyLevel.CRITICAL);
    expect(result.emergencyHotlinesTriggered).toBe(true);
    expect(result.recommendedNextModule).toBe('EMERGENCY_HOTLINE');
  });
});
