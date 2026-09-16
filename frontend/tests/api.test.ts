import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkHealth,
  triageIssue,
  analyzeContract,
  executeCognitiveLoop,
  matchLegalAid,
  generateProSeLetter,
  LegalDomain,
  UrgencyLevel,
  ClauseRiskTier,
} from '../src/services/api';

describe('Frontend API Service Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkHealth', () => {
    it('returns backend health status when endpoint is accessible', async () => {
      const mockHealth = {
        status: 'UP',
        service: 'JurisAccess AI (LexisLoop)',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockHealth,
      } as Response);

      const result = await checkHealth();
      expect(result.status).toBe('UP');
      expect(result.service).toContain('JurisAccess');
    });

    it('gracefully falls back to offline simulation when endpoint fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await checkHealth();
      expect(result.status).toBe('OFFLINE_SIMULATION');
      expect(result.service).toBe('JurisAccess Client Fallback');
    });
  });

  describe('triageIssue', () => {
    it('correctly categorizes an emergency eviction notice and assigns critical urgency', async () => {
      // Offline fallback test
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      const result = await triageIssue({
        query: 'I just received a 3-day notice to quit and the landlord is threatening a lockout',
        state: 'CA',
        zipCode: '90012',
      });

      expect(result.detectedDomain).toBe(LegalDomain.TENANCY_AND_HOUSING);
      expect(result.urgencyLevel).toBe(UrgencyLevel.CRITICAL);
      expect(result.emergencyHotlinesTriggered).toBe(true);
      expect(result.recommendedNextModule).toBe('EMERGENCY_HOTLINE');
      expect(result.nextSteps.length).toBeGreaterThan(0);
      expect(result.disclaimer).toContain('JurisAccess AI is an automated educational tool');
    });

    it('correctly categorizes wage claims under employment domain', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      const result = await triageIssue({
        query: 'My boss did not pay my overtime and withheld my paycheck',
        state: 'NY',
      });

      expect(result.detectedDomain).toBe(LegalDomain.EMPLOYMENT_AND_LABOR);
      expect(result.urgencyLevel).toBe(UrgencyLevel.HIGH);
      expect(result.nextSteps.some((step) => step.toLowerCase().includes('wage'))).toBe(true);
    });

    it('parses live backend response when available', async () => {
      const liveData = {
        detectedDomain: LegalDomain.CONSUMER_AND_DEBT,
        confidenceScore: 0.96,
        urgencyLevel: UrgencyLevel.MEDIUM,
        urgencyReasoning: 'FDCPA debt dispute.',
        emergencyHotlinesTriggered: false,
        recommendedNextModule: 'DEMYSITIFIER',
        nextSteps: ['Send debt validation letter'],
        disclaimer: 'Educational only.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: liveData }),
      } as Response);

      const result = await triageIssue({ query: 'Collector calling me about old medical debt' });
      expect(result.detectedDomain).toBe(LegalDomain.CONSUMER_AND_DEBT);
      expect(result.urgencyLevel).toBe(UrgencyLevel.MEDIUM);
      expect(result.confidenceScore).toBe(0.96);
    });
  });

  describe('analyzeContract', () => {
    it('returns structured clause breakdown with risk tiers and statutory defects', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      const result = await analyzeContract({
        documentText: 'Tenant hereby unconditionally waives all statutory rights under Civil Code Section 1942.',
        jurisdiction: 'California',
      });

      expect(result.readingGradeLevel).toBeLessThanOrEqual(8);
      expect(result.predatoryClauses.length).toBeGreaterThanOrEqual(1);
      expect(result.predatoryClauses[0].riskTier).toBe(ClauseRiskTier.RED_PREDATORY);
      expect(result.predatoryClauses[0].statutoryDefect).toContain('1953');
      expect(result.assertableRights.length).toBeGreaterThan(0);
      expect(result.actionChecklist.length).toBeGreaterThan(0);
    });
  });

  describe('executeCognitiveLoop', () => {
    it('executes cognitive loop receipt fallback and returns convergence receipt', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      const result = await executeCognitiveLoop({
        documentText: 'Lease agreement with waiver of habitability.',
        state: 'CA',
        zipCode: '90012',
      });

      expect(result.converged).toBe(true);
      expect(result.totalIterations).toBeGreaterThanOrEqual(1);
      expect(result.finalAuditScore).toBeGreaterThan(90);
      expect(result.triage).toBeDefined();
      expect(result.verifiedAnalysis).toBeDefined();
      expect(result.recommendedClinics.length).toBeGreaterThan(0);
    });
  });

  describe('matchLegalAid', () => {
    it('correctly calculates FPL ratio and flags income qualification under 200% FPL', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      // Household of 3: Threshold = 15060 + 2 * 5380 = 25820.
      // Income = 24000 => ~93% FPL => Eligible!
      const result = await matchLegalAid({
        zipCode: '90012',
        state: 'CA',
        annualHouseholdIncome: 24000,
        householdSize: 3,
      });

      expect(result.isEligibleForFreeLegalAid).toBe(true);
      expect(result.estimatedFplPercentage).toBeLessThanOrEqual(100);
      expect(result.clinics.length).toBeGreaterThan(0);
      expect(result.intakeChecklist.recommendedDocuments.length).toBeGreaterThan(0);
    });

    it('flags high income households as exceeding typical 200% FPL threshold', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      // Household of 1: Threshold = 15060.
      // Income = 90000 => ~598% FPL => Ineligible
      const result = await matchLegalAid({
        zipCode: '90012',
        state: 'CA',
        annualHouseholdIncome: 90000,
        householdSize: 1,
      });

      expect(result.isEligibleForFreeLegalAid).toBe(false);
      expect(result.estimatedFplPercentage).toBeGreaterThan(200);
    });
  });

  describe('generateProSeLetter', () => {
    it('generates a security deposit demand with statutory citation and certified mail steps', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      const result = await generateProSeLetter({
        templateType: 'SECURITY_DEPOSIT_RETURN',
        senderName: 'Jane Doe',
        senderAddress: '123 Main St, Apt 4, Los Angeles, CA',
        recipientName: 'Apex Property Management',
        recipientAddress: '456 Commercial Blvd, Los Angeles, CA',
        disputedAmount: 2200,
        includeTrebleDamages: true,
      });

      expect(result.formalCitation).toContain('1950.5');
      expect(result.statutoryDeadlineDays).toBe(21);
      expect(result.letterText).toContain('DEMAND FOR IMMEDIATE RETURN OF RESIDENTIAL SECURITY DEPOSIT');
      expect(result.letterText).toContain('Jane Doe');
      expect(result.letterText).toContain('Apex Property Management');
      expect(result.letterText).toContain('$2200.00');
      expect(result.letterText).toContain('punitive damages');
      expect(result.certifiedMailInstructions.length).toBe(4);
    });

    it('generates an FDCPA debt validation demand letter', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      const result = await generateProSeLetter({
        templateType: 'FDCPA_DEBT_VALIDATION',
        senderName: 'John Smith',
        senderAddress: '789 Oak Rd, Austin, TX',
        recipientName: 'Credit Collection Bureau',
        recipientAddress: '100 Collections Way, Dallas, TX',
        disputedAmount: 1450,
      });

      expect(result.formalCitation).toContain('1692g');
      expect(result.statutoryDeadlineDays).toBe(30);
      expect(result.letterText).toContain('15 U.S.C. § 1692g');
    });
  });

  describe('apiStatus Store & fetchWithTimeout', () => {
    it('manages status state and notifies subscribers on transition', async () => {
      const { setApiStatus, getApiStatus, subscribeApiStatus } = await import('../src/services/apiStatus');

      let notifiedStatus = '';
      const unsubscribe = subscribeApiStatus((status) => {
        notifiedStatus = status;
      });

      setApiStatus('live');
      expect(getApiStatus()).toBe('live');
      expect(notifiedStatus).toBe('live');

      setApiStatus('offline');
      expect(getApiStatus()).toBe('offline');
      expect(notifiedStatus).toBe('offline');

      unsubscribe();
    });

    it('wraps fetch with timeout and resolves timely responses', async () => {
      const { fetchWithTimeout } = await import('../src/services/fetchWithTimeout');

      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
      const res = await fetchWithTimeout('https://api.test/resource', {}, 1000);
      expect(res).toBeDefined();
    });
  });
});

