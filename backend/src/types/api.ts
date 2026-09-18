/**
 * JurisAccess AI - API DTOs & Zod Validation Schemas
 */

import { z } from 'zod';
import { LegalDomain } from './legal';

// Standard API response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

// 1. Triage Request Schema
export const TriageRequestSchema = z.object({
  query: z.string().min(5, 'Query must be at least 5 characters long').max(10000, 'Query exceeds 10,000 character limit'),
  state: z.string().length(2, 'State must be a 2-letter postal code (e.g. CA, NY, TX)').optional(),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be a 5-digit number').optional(),
  domainHint: z.nativeEnum(LegalDomain).optional(),
});

export type TriageRequest = z.infer<typeof TriageRequestSchema>;

// 2. Document Analysis Request Schema
export const AnalysisRequestSchema = z.object({
  documentText: z.string().min(10, 'Document text must be at least 10 characters').max(50000, 'Document text exceeds 50,000 character limit'),
  domainHint: z.nativeEnum(LegalDomain).optional(),
  jurisdiction: z.string().default('General US'),
  maxIterations: z.number().int().min(1).max(3).default(3),
});

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;

// 3. Legal Aid Matcher Request Schema
export const LegalAidRequestSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  state: z.string().length(2, 'State must be 2 characters (e.g., CA)'),
  domain: z.nativeEnum(LegalDomain).optional(),
  annualHouseholdIncome: z.number().min(0).optional(),
  householdSize: z.number().int().min(1).max(15).optional(),
});

export type LegalAidRequest = z.infer<typeof LegalAidRequestSchema>;

// 4. Pro Se Letter Builder Schema
export const ProSeLetterRequestSchema = z.object({
  templateType: z.enum([
    'SECURITY_DEPOSIT_RETURN',
    'HABITABILITY_REPAIR_DEMAND',
    'UNPAID_WAGES_DEMAND',
    'FDCPA_DEBT_VALIDATION',
  ]),
  senderName: z.string().min(2),
  senderAddress: z.string().min(5),
  recipientName: z.string().min(2),
  recipientAddress: z.string().min(5),
  rentalOrWorkplaceAddress: z.string().optional(),
  disputedAmount: z.number().positive().optional(),
  incidentDate: z.string().optional(),
  additionalContext: z.string().max(2000).optional(),
});

export type ProSeLetterRequest = z.infer<typeof ProSeLetterRequestSchema>;
