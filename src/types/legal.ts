/**
 * JurisAccess AI - Legal Domain Types & Enums
 */

export enum LegalDomain {
  TENANCY_AND_HOUSING = 'TENANCY_AND_HOUSING',
  EMPLOYMENT_AND_LABOR = 'EMPLOYMENT_AND_LABOR',
  CONSUMER_AND_DEBT = 'CONSUMER_AND_DEBT',
  FAMILY_AND_DOMESTIC = 'FAMILY_AND_DOMESTIC',
  CIVIL_RIGHTS_AND_IMMIGRATION = 'CIVIL_RIGHTS_AND_IMMIGRATION',
  GENERAL_CIVIL = 'GENERAL_CIVIL',
}

export enum UrgencyLevel {
  CRITICAL = 'CRITICAL', // Immediate eviction, protective order, < 72h court date
  HIGH = 'HIGH',         // Statute of limitations expiring <= 14 days, default notice
  MEDIUM = 'MEDIUM',     // Active ongoing dispute with standard response window
  LOW = 'LOW',           // General educational inquiry, pre-signing contract review
}

export enum ClauseRiskTier {
  RED_PREDATORY = 'RED_PREDATORY',       // Likely illegal, void against public policy
  AMBER_UNFAVORABLE = 'AMBER_UNFAVORABLE', // Heavy one-sided burden on consumer/tenant
  GREEN_STANDARD = 'GREEN_STANDARD',       // Standard statutory / customary term
}

export interface PredatoryClause {
  clauseId: string;
  originalText: string;
  plainMeaning: string;
  riskTier: ClauseRiskTier;
  statutoryDefect: string;
  recommendedAction: string;
}

export interface StatutoryRight {
  rightName: string;
  citation: string;
  jurisdiction: string;
  plainDescription: string;
  howToAssert: string;
}

export interface LegalAidClinic {
  id: string;
  name: string;
  jurisdiction: string;
  state: string;
  zipCodesServed: string[];
  practiceAreas: LegalDomain[];
  incomeLimitFplPercentage: number; // e.g., 125, 200 (Federal Poverty Level %)
  phone: string;
  address: string;
  website: string;
  walkInHours: string;
  isLscFunded: boolean;
}

export interface ProSeNoticeTemplate {
  templateId: string;
  title: string;
  domain: LegalDomain;
  defaultStatutoryBasis: string;
  requiredFields: string[];
}
