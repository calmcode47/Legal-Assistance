/**
 * JurisAccess AI - HTTP API End-to-End Integration Tests
 */

import { afterEach, describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { CriticAgent } from '../src/agents/criticAgent';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('JurisAccess REST API Endpoints', () => {
  it('GET /api/health should return HEALTHY status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.service).toBe('JurisAccess AI (LexisLoop)');
    expect(res.headers['content-security-policy']).toContain("script-src 'self'");
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  it('POST /api/triage should categorize legal problem and return 200', async () => {
    const res = await request(app)
      .post('/api/triage')
      .send({
        query: 'My landlord locked me out of my apartment without an eviction notice.',
        state: 'CA',
        zipCode: '90012',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.detectedDomain).toBe('TENANCY_AND_HOUSING');
    expect(res.body.data.urgencyLevel).toBe('CRITICAL');
  });

  it('POST /api/triage should reject invalid payloads with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/triage')
      .send({
        query: 'hi', // too short (< 5 chars)
        zipCode: '123', // invalid format (not 5 digits)
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/analyze-contract should demystify clauses and return plain English', async () => {
    const res = await request(app)
      .post('/api/analyze-contract')
      .send({
        documentText: 'Tenant agrees to waive statutory 24-hour notice of inspection. Rent is due on 1st.',
        jurisdiction: 'California',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plainLanguageSummary).toBeDefined();
    expect(res.body.data.readingGradeLevel).toBeLessThanOrEqual(7.0);
    expect(res.body.data.disclaimer).toContain('JurisAccess AI is an automated educational tool');
  });

  it('POST /api/analyze-contract withholds an unverified draft after all allowed attempts', async () => {
    vi.spyOn(CriticAgent, 'auditDraft').mockResolvedValue({
      auditId: 'AUDIT_REJECT',
      iterationEvaluated: 1,
      scoreBreakdown: {
        factualGroundingScore: 20,
        uplComplianceScore: 25,
        readabilityScore: 20,
        actionabilityScore: 15,
        aggregateScore: 80,
      },
      hasUplViolation: false,
      hasHallucinatedCitation: true,
      verdict: 'REJECT',
      criticalDefects: ['Citation could not be verified.'],
      remediationInstructions: ['Remove the unsupported citation.'],
    });

    const res = await request(app)
      .post('/api/analyze-contract')
      .send({
        documentText: 'Tenant waives statutory 24-hour notice of inspection. Rent is due on the first day of each month.',
        maxIterations: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.predatoryClauses).toEqual([]);
    expect(res.body.data.plainLanguageSummary).toMatch(/could not verify/i);
    expect(res.body.data.disclaimer).toContain('JurisAccess AI is an automated educational tool');
  });

  it('POST /api/match-aid should find verified legal aid clinics', async () => {
    const res = await request(app)
      .post('/api/match-aid')
      .send({
        zipCode: '90012',
        state: 'CA',
        domain: 'TENANCY_AND_HOUSING',
        annualHouseholdIncome: 24000,
        householdSize: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.clinics.length).toBeGreaterThan(0);
    expect(res.body.data.clinics[0].name).toContain('Legal Aid');
  });

  it('POST /api/pro-se-letter should format a legal demand notice', async () => {
    const res = await request(app)
      .post('/api/pro-se-letter')
      .send({
        templateType: 'SECURITY_DEPOSIT_RETURN',
        senderName: 'Elena Gomez',
        senderAddress: '456 Oak St, Los Angeles, CA',
        recipientName: 'Apex Property Management',
        recipientAddress: '789 Commercial Blvd, Los Angeles, CA',
        rentalOrWorkplaceAddress: '123 Main St, Apt 2B, Los Angeles, CA',
        disputedAmount: 1850.0,
        incidentDate: 'August 31, 2026',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.letterText).toContain('FORMAL DEMAND FOR RETURN OF SECURITY DEPOSIT');
    expect(res.body.data.letterText).toContain('$1850.00');
    expect(res.body.data.letterText).toContain('Elena Gomez');
  });

  it('POST /api/loop-execute should run full 5-stage loop with execution receipt', async () => {
    const res = await request(app)
      .post('/api/loop-execute')
      .send({
        documentText: 'Landlord served 3-day notice to quit for $1,200 past due rent at 123 Pine St.',
        jurisdiction: 'California',
        state: 'CA',
        zipCode: '90012',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sessionId).toBeDefined();
    expect(res.body.data.converged).toBe(true);
    expect(res.body.data.finalAuditScore).toBeGreaterThanOrEqual(95);
  });

  it('POST /api/loop-execute preserves location fields for local clinic matching', async () => {
    const res = await request(app)
      .post('/api/loop-execute')
      .send({
        documentText: 'My landlord served a three-day notice to quit for alleged late rent.',
        jurisdiction: 'New York',
        state: 'NY',
        zipCode: '10001',
        maxIterations: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recommendedClinics[0].state).toBe('NY');
  });
});
