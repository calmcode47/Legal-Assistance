/**
 * JurisAccess AI - Agent & Cognitive Loop Types
 */

import { LegalDomain, UrgencyLevel, PredatoryClause, StatutoryRight, LegalAidClinic } from './legal';

export interface PIIMappingTable {
  [token: string]: string;
}

export interface SanitizedInput {
  sanitizedText: string;
  tokenMap: PIIMappingTable;
  detectedCount: number;
}

export interface TriageResult {
  detectedDomain: LegalDomain;
  confidenceScore: number;
  urgencyLevel: UrgencyLevel;
  urgencyReasoning: string;
  statutoryDeadlineAlert?: string;
  emergencyHotlinesTriggered: boolean;
  recommendedNextModule: 'DEMYSTIFIER' | 'RIGHTS_NAVIGATOR' | 'AID_LOCATOR' | 'EMERGENCY_HOTLINE';
}

export interface ExplainerDraft {
  iterationNumber: number;
  plainLanguageSummary: string;
  readingGradeLevel: number; // e.g. 6.2
  predatoryClauses: PredatoryClause[];
  assertableRights: StatutoryRight[];
  actionChecklist: string[];
  disclaimer: string;
}

export interface CriticScoreBreakdown {
  factualGroundingScore: number; // 0-30
  uplComplianceScore: number;    // 0-25
  readabilityScore: number;      // 0-25
  actionabilityScore: number;    // 0-20
  aggregateScore: number;        // 0-100
}

export interface CriticAudit {
  auditId: string;
  iterationEvaluated: number;
  scoreBreakdown: CriticScoreBreakdown;
  hasUplViolation: boolean;
  hasHallucinatedCitation: boolean;
  verdict: 'PASS' | 'REJECT';
  criticalDefects: string[];
  remediationInstructions: string[];
  score?: number;
  approved?: boolean;
  uplViolations?: string[];
  feedback?: string;
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
  status: 'converged' | 'unresolved';
  finalAuditScore: number;
  score?: number;
  triage: TriageResult;
  verifiedAnalysis: ExplainerDraft;
  output: {
    plainLanguage: string;
    clauses: unknown[];
  };
  lastCriticFeedback: string;
  safeFallback?: SafeFallback;
  recommendedClinics: LegalAidClinic[];
  executionTimeMs: number;
  timestamp: string;
}
