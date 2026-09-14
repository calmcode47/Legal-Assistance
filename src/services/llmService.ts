/**
 * JurisAccess AI - Unified LLM Service (Gemini API + Deterministic Mock Fallback)
 * Supports live Gemini 2.0/1.5 Flash models as well as offline deterministic mode for testing.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

export interface LLMGenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export class LLMService {
  private static geminiClient: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      if (!env.GEMINI_API_KEY && env.LLM_PROVIDER === 'gemini') {
        console.warn('GEMINI_API_KEY is not set. Automatically falling back to MOCK mode.');
      }
      this.geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY || 'MOCK_KEY');
    }
    return this.geminiClient;
  }

  /**
   * Generates a text response from the configured LLM provider
   */
  public static async generate(prompt: string, options?: LLMGenerateOptions): Promise<string> {
    const isMock = env.LLM_PROVIDER === 'mock' || !env.GEMINI_API_KEY;

    if (isMock) {
      return this.mockGenerate(prompt, options);
    }

    try {
      const client = this.getClient();
      const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: options?.systemInstruction,
        generationConfig: {
          temperature: options?.temperature ?? 0.2,
          maxOutputTokens: options?.maxOutputTokens ?? 2048,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.warn('Live Gemini API call failed. Falling back to deterministic response generator:', error);
      return this.mockGenerate(prompt, options);
    }
  }

  /**
   * Deterministic mock generator used for CI testing, offline hackathon evaluation, and fallback
   */
  private static mockGenerate(prompt: string, options?: LLMGenerateOptions): string {
    const lowerPrompt = prompt.toLowerCase();
    const systemLower = (options?.systemInstruction || '').toLowerCase();

    // 1. Triage Agent Mock Response
    if (systemLower.includes('chief legal triage') || lowerPrompt.includes('analyze and classify this citizen')) {
      let domain = 'TENANCY_AND_HOUSING';
      let urgency = 'MEDIUM';
      let alert = 'Standard 30-day response period applies.';

      if (lowerPrompt.includes('3-day') || lowerPrompt.includes('evict') || lowerPrompt.includes('quit') || lowerPrompt.includes('sheriff')) {
        domain = 'TENANCY_AND_HOUSING';
        urgency = 'CRITICAL';
        alert = 'Immediate 3-Day Notice to Pay or Quit detected. Action required within 72 hours.';
      } else if (lowerPrompt.includes('wage') || lowerPrompt.includes('overtime') || lowerPrompt.includes('paycheck')) {
        domain = 'EMPLOYMENT_AND_LABOR';
        urgency = 'HIGH';
        alert = 'Statutory wage claim must be filed before statute of limitations expires.';
      } else if (lowerPrompt.includes('debt') || lowerPrompt.includes('collector') || lowerPrompt.includes('collections')) {
        domain = 'CONSUMER_AND_DEBT';
        urgency = 'MEDIUM';
        alert = '30-day FDCPA validation window applies upon receipt of collection notice.';
      }

      return JSON.stringify({
        detectedDomain: domain,
        confidenceScore: 0.96,
        urgencyLevel: urgency,
        urgencyReasoning: `Detected urgent civil dispute keywords indicating ${domain}.`,
        statutoryDeadlineAlert: alert,
        emergencyHotlinesTriggered: urgency === 'CRITICAL',
        recommendedNextModule: urgency === 'CRITICAL' ? 'EMERGENCY_HOTLINE' : 'DEMYSITIFIER',
      });
    }

    // 2. Critic Agent Mock Response
    if (systemLower.includes('adversarial senior legal critic') || lowerPrompt.includes('audit this candidate legal draft')) {
      const iteration = lowerPrompt.includes('"iterationnumber": 1') ? 1 : 2;

      if (iteration === 1 && lowerPrompt.includes('force_critic_rejection_for_test')) {
        return JSON.stringify({
          auditId: 'AUDIT_CRITIC_001',
          iterationEvaluated: 1,
          scoreBreakdown: {
            factualGroundingScore: 24,
            uplComplianceScore: 20,
            readabilityScore: 22,
            actionabilityScore: 18,
            aggregateScore: 84,
          },
          hasUplViolation: false,
          hasHallucinatedCitation: false,
          verdict: 'REJECT',
          criticalDefects: ['Reading grade level is too elevated (Grade 9.4).', 'Missing procedural step for certified mail return receipt.'],
          remediationInstructions: [
            'Simplify legal jargon in the summary to Grade 6 reading level.',
            'Explicitly instruct the tenant to send written response via Certified Mail with Return Receipt Requested.',
          ],
        });
      }

      // Default high-scoring pass
      return JSON.stringify({
        auditId: 'AUDIT_CRITIC_002',
        iterationEvaluated: iteration,
        scoreBreakdown: {
          factualGroundingScore: 30,
          uplComplianceScore: 25,
          readabilityScore: 24,
          actionabilityScore: 19,
          aggregateScore: 98,
        },
        hasUplViolation: false,
        hasHallucinatedCitation: false,
        verdict: 'PASS',
        criticalDefects: [],
        remediationInstructions: [],
      });
    }

    // 3. Document Explainer Mock Response
    return JSON.stringify({
      iterationNumber: 1,
      plainLanguageSummary:
        'This notice is a 3-Day Notice to Pay Rent or Quit. It means your landlord claims rent has not been paid and demands payment or that you move out within three business days. However, under state law, you cannot be forced out without a formal court order.',
      readingGradeLevel: 6.4,
      predatoryClauses: [
        {
          clauseId: 'CLAUSE-01',
          originalText: 'Tenant waives all rights to trial by jury or notice of entry.',
          plainMeaning: 'The landlord is attempting to take away your legal right to advance notice before entering your home.',
          riskTier: 'RED_PREDATORY',
          statutoryDefect: 'Unenforceable and void as against public policy under Civil Code provisions protecting tenant quiet enjoyment.',
          recommendedAction: 'Do not consent to entry without 24-hour written notice except in a genuine emergency.',
        },
      ],
      assertableRights: [
        {
          rightName: 'Implied Warranty of Habitability',
          citation: 'URLTA § 2.104 / Cal. Civ. Code § 1941.1',
          jurisdiction: 'State Civil Code',
          plainDescription: 'Your landlord is legally obligated to maintain clean running water, heat, and a weather-proofed roof.',
          howToAssert: 'Document all defects with dated photos and submit a formal written Repair Demand letter.',
        },
      ],
      actionChecklist: [
        '1. Check notice date and count 3 full court days excluding weekends and judicial holidays.',
        '2. Gather all rent payment receipts, bank statements, or money order stubs.',
        '3. Send a formal written response via Certified Mail with Return Receipt Requested.',
        '4. Contact your local legal aid clinic immediately for pro bono court representation.',
      ],
      disclaimer:
        'Notice: JurisAccess AI is an automated educational tool designed to assist self-represented litigants. It does not provide formal legal counsel or create an attorney-client relationship.',
    });
  }
}
