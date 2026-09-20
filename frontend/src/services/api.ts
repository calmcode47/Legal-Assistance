/**
 * JurisAccess AI - API Service Layer & DTOs
 * Live network calls + thin offline educational fallbacks.
 */

import { fetchWithTimeout } from './fetchWithTimeout';
import { setApiStatus } from './apiStatus';

// The substantial offline educational catalogue is deliberately split from the
// first-load bundle. It is fetched only if the live service is unreachable.
const loadOfflineFallbacks = () => import('./offlineFallbacks');

export const LegalDomain = {
  TENANCY_AND_HOUSING: 'TENANCY_AND_HOUSING',
  EMPLOYMENT_AND_LABOR: 'EMPLOYMENT_AND_LABOR',
  CONSUMER_AND_DEBT: 'CONSUMER_AND_DEBT',
  FAMILY_AND_DOMESTIC: 'FAMILY_AND_DOMESTIC',
  CIVIL_RIGHTS_AND_IMMIGRATION: 'CIVIL_RIGHTS_AND_IMMIGRATION',
  GENERAL_CIVIL: 'GENERAL_CIVIL',
} as const;

export type LegalDomainType = (typeof LegalDomain)[keyof typeof LegalDomain];

export const UrgencyLevel = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type UrgencyLevelType = (typeof UrgencyLevel)[keyof typeof UrgencyLevel];

export const ClauseRiskTier = {
  RED_PREDATORY: 'RED_PREDATORY',
  AMBER_UNFAVORABLE: 'AMBER_UNFAVORABLE',
  GREEN_STANDARD: 'GREEN_STANDARD',
} as const;

export type ClauseRiskTierType = (typeof ClauseRiskTier)[keyof typeof ClauseRiskTier];

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

export interface TriageRequest {
  query: string;
  state?: string;
  zipCode?: string;
  domainHint?: LegalDomainType;
}

export interface TriageResult {
  detectedDomain: LegalDomainType;
  confidenceScore: number;
  urgencyLevel: UrgencyLevelType;
  urgencyReasoning: string;
  statutoryDeadlineAlert?: string;
  emergencyHotlinesTriggered: boolean;
  recommendedNextModule: 'DEMYSTIFIER' | 'RIGHTS_NAVIGATOR' | 'AID_LOCATOR' | 'EMERGENCY_HOTLINE';
  nextSteps: string[];
  disclaimer: string;
}

export type TriageData = TriageResult;

export interface PredatoryClause {
  clauseId: string;
  originalText: string;
  plainMeaning: string;
  riskTier: ClauseRiskTierType;
  statutoryDefect: string;
  recommendedAction: string;
  lineNumber?: number;
}

export type PredatoryClauseItem = PredatoryClause;

export interface StatutoryRight {
  rightName: string;
  citation: string;
  jurisdiction: string;
  plainDescription: string;
  howToAssert: string;
}

export interface ExplainerDraft {
  iterationNumber: number;
  plainLanguageSummary: string;
  readingGradeLevel: number;
  predatoryClauses: PredatoryClause[];
  assertableRights: StatutoryRight[];
  actionChecklist: string[];
  disclaimer: string;
}

export interface AnalysisRequest {
  documentText: string;
  domainHint?: LegalDomainType;
  jurisdiction?: string;
  maxIterations?: number;
}

export interface LoopRequest {
  documentText: string;
  domainHint?: LegalDomainType;
  jurisdiction?: string;
  state?: string;
  zipCode?: string;
  maxIterations?: number;
}

export interface SafeFallback {
  disclaimer: string;
  generalEducationalInfo: string;
  recommendedAction: string;
}

export interface LoopExecutionReceipt {
  sessionId: string;
  totalIterations: number;
  iterations?: number;
  converged: boolean;
  status?: 'converged' | 'unresolved';
  finalAuditScore: number;
  score?: number;
  triage: TriageResult;
  verifiedAnalysis: ExplainerDraft;
  output?: {
    plainLanguage: string;
    clauses: unknown[];
  };
  lastCriticFeedback?: string;
  safeFallback?: SafeFallback;
  recommendedClinics: LegalAidClinic[];
  executionTimeMs: number;
  timestamp: string;
}

export interface LegalAidRequest {
  zipCode: string;
  state: string;
  domain?: LegalDomainType;
  annualHouseholdIncome?: number;
  householdSize?: number;
  userSituation?: string;
}

export interface LegalAidClinic {
  id: string;
  name: string;
  jurisdiction: string;
  state: string;
  zipCodesServed: string[];
  practiceAreas: (LegalDomainType | string)[];
  incomeLimitFplPercentage: number;
  phone: string;
  address: string;
  website: string;
  walkInHours: string;
  isLscFunded: boolean;
}

export type ClinicItem = LegalAidClinic;

export interface IntakeChecklistResult {
  eligibilityOverview: string;
  recommendedDocuments: string[];
  intakeQuestionsToExpect: string[];
  urgencyNote: string;
}

export interface LegalAidData {
  zipCode: string;
  state: string;
  estimatedFplPercentage: number;
  isEligibleForFreeLegalAid: boolean;
  clinics: LegalAidClinic[];
  intakeChecklist: IntakeChecklistResult;
}

export interface ProSeLetterRequest {
  templateType:
    | 'SECURITY_DEPOSIT_RETURN'
    | 'HABITABILITY_REPAIR_DEMAND'
    | 'UNPAID_WAGES_DEMAND'
    | 'FDCPA_DEBT_VALIDATION';
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  rentalOrWorkplaceAddress?: string;
  disputedAmount?: number;
  incidentDate?: string;
  includeTrebleDamages?: boolean;
  additionalContext?: string;
}

export interface ProSeLetterData {
  templateType: string;
  formalCitation: string;
  statutoryDeadlineDays: number;
  letterText: string;
  certifiedMailInstructions: string[];
}

const API_BASE = (() => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  const windowUrl =
    typeof window !== 'undefined' &&
    (window as unknown as { RENDER_BACKEND_URL?: string }).RENDER_BACKEND_URL;
  if (windowUrl) {
    return windowUrl.endsWith('/api') ? windowUrl : `${windowUrl.replace(/\/$/, '')}/api`;
  }
  return '/api';
})();

function normalizeModule(
  module: string | undefined
): TriageResult['recommendedNextModule'] {
  if (module === 'DEMYSITIFIER' || module === 'DEMYSTIFIER') return 'DEMYSTIFIER';
  if (module === 'RIGHTS_NAVIGATOR' || module === 'AID_LOCATOR' || module === 'EMERGENCY_HOTLINE') {
    return module;
  }
  return 'DEMYSTIFIER';
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 4000);
    if (res.ok) {
      setApiStatus('live');
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend health check unreachable:', err);
  }
  setApiStatus('offline');
  return {
    status: 'OFFLINE_SIMULATION',
    service: 'JurisAccess Client Fallback',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };
}

export async function triageIssue(payload: TriageRequest): Promise<TriageResult> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setApiStatus('live');
      const d = json.data;
      return {
        detectedDomain: d.detectedDomain,
        confidenceScore: d.confidenceScore ?? 0.95,
        urgencyLevel: d.urgencyLevel,
        urgencyReasoning: d.urgencyReasoning,
        statutoryDeadlineAlert: d.statutoryDeadlineAlert,
        emergencyHotlinesTriggered: Boolean(d.emergencyHotlinesTriggered),
        recommendedNextModule: normalizeModule(d.recommendedNextModule),
        nextSteps: d.nextSteps || [],
        disclaimer:
          d.disclaimer ||
          'JurisAccess AI is an automated educational tool designed to assist self-represented litigants. It does not provide formal legal counsel or create an attorney-client relationship.',
      };
    }
  } catch (err) {
    console.warn('Backend unavailable, using offline educational triage simulation:', err);
  }
  setApiStatus('offline');
  const { offlineTriage } = await loadOfflineFallbacks();
  return offlineTriage(payload);
}

export async function analyzeContract(payload: AnalysisRequest): Promise<ExplainerDraft> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/analyze-contract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setApiStatus('live');
      return json.data;
    }
  } catch (err) {
    console.warn('Backend unavailable, using offline educational explainer simulation:', err);
  }
  setApiStatus('offline');
  const { offlineAnalyze } = await loadOfflineFallbacks();
  return offlineAnalyze(payload);
}

export async function executeCognitiveLoop(payload: LoopRequest): Promise<LoopExecutionReceipt> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/loop-execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      12000
    );
    const json = await res.json();
    if (json.success && json.data) {
      setApiStatus('live');
      return json.data;
    }
  } catch (err) {
    console.warn('Backend loop-execute unavailable, using offline educational loop simulation:', err);
  }
  setApiStatus('offline');
  // Pure local fallback — no chained network retries
  const { offlineCognitiveLoop } = await loadOfflineFallbacks();
  return offlineCognitiveLoop(payload);
}

export async function matchLegalAid(payload: LegalAidRequest): Promise<LegalAidData> {
  const income = payload.annualHouseholdIncome ?? 24000;
  const household = payload.householdSize ?? 3;
  const fplThreshold = 15060 + (household - 1) * 5380;
  const fplRatio = Math.round((income / fplThreshold) * 100);

  try {
    const res = await fetchWithTimeout(`${API_BASE}/match-aid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zipCode: payload.zipCode,
        state: payload.state,
        domain: payload.domain,
        annualHouseholdIncome: payload.annualHouseholdIncome,
        householdSize: payload.householdSize,
      }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      setApiStatus('live');
      const data = json.data;
      const clinics: LegalAidClinic[] = data.clinics || [];
      const rawChecklist = data.intakeChecklist;
      const intakeChecklist: IntakeChecklistResult =
        rawChecklist && typeof rawChecklist === 'object'
          ? {
              eligibilityOverview:
                rawChecklist.eligibilityOverview ||
                `Under LSC guidelines, free legal aid is generally available for households earning up to 125%-200% of the Federal Poverty Level. Your household is at ~${fplRatio}% FPL.`,
              recommendedDocuments: rawChecklist.recommendedDocuments || [
                'Original copy of notice to vacate, summons, or disputed agreement',
                'Proof of monthly household income (recent paystub, W2, or benefit award letter)',
                'Proof of rent payments or financial transactions',
                'Photographs or written logs documenting conditions or unpaid hours',
              ],
              intakeQuestionsToExpect: rawChecklist.intakeQuestionsToExpect || [
                'What exact date was the notice or demand served?',
                'What is the total disputed dollar amount claimed?',
                'Has the landlord, employer, or collector initiated formal court proceedings?',
              ],
              urgencyNote:
                rawChecklist.urgencyNote ||
                'Contact the clinic as early as possible during walk-in morning hours.',
            }
          : (await loadOfflineFallbacks()).offlineMatchAid(payload).intakeChecklist;

      return {
        zipCode: payload.zipCode,
        state: payload.state,
        estimatedFplPercentage: fplRatio,
        isEligibleForFreeLegalAid: fplRatio <= 200,
        clinics,
        intakeChecklist,
      };
    }
  } catch (err) {
    console.warn('Backend unavailable, using offline legal aid directory:', err);
  }
  setApiStatus('offline');
  const { offlineMatchAid } = await loadOfflineFallbacks();
  return offlineMatchAid(payload);
}

export async function generateProSeLetter(payload: ProSeLetterRequest): Promise<ProSeLetterData> {
  let additionalContext = payload.additionalContext || '';
  if (payload.includeTrebleDamages && !additionalContext.includes('Treble Damages')) {
    additionalContext =
      `Notice of Bad Faith Penalties: Under applicable statutory law, bad faith retention may subject the respondent to statutory punitive damages.\n${additionalContext}`.trim();
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/pro-se-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: payload.templateType,
        senderName: payload.senderName,
        senderAddress: payload.senderAddress,
        recipientName: payload.recipientName,
        recipientAddress: payload.recipientAddress,
        rentalOrWorkplaceAddress: payload.rentalOrWorkplaceAddress,
        disputedAmount: payload.disputedAmount,
        incidentDate: payload.incidentDate,
        additionalContext: additionalContext || undefined,
      }),
    });
    const json = await res.json();
    if (json.success && json.data && json.data.letterText) {
      setApiStatus('live');
      const { offlineProSeLetter } = await loadOfflineFallbacks();
      const offlineMeta = offlineProSeLetter(payload);
      return {
        templateType: payload.templateType,
        formalCitation: offlineMeta.formalCitation,
        statutoryDeadlineDays: offlineMeta.statutoryDeadlineDays,
        letterText: json.data.letterText,
        certifiedMailInstructions: offlineMeta.certifiedMailInstructions,
      };
    }
  } catch (err) {
    console.warn('Backend unavailable, generating offline educational demand letter:', err);
  }
  setApiStatus('offline');
  const { offlineProSeLetter } = await loadOfflineFallbacks();
  return offlineProSeLetter({ ...payload, additionalContext });
}
