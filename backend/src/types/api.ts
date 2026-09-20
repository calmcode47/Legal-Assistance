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
  query: z.string().trim().min(5, 'Query must be at least 5 characters long').max(4000, 'Query exceeds 4,000 character limit'),
  state: z.string().trim().toUpperCase().length(2, 'State must be a 2-letter postal code (e.g. CA, NY, TX)').optional(),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be a 5-digit number').optional(),
  domainHint: z.nativeEnum(LegalDomain).optional(),
}).strict();

export type TriageRequest = z.infer<typeof TriageRequestSchema>;

// 2. Document Analysis Request Schema
export const AnalysisRequestSchema = z.object({
  documentText: z.string().min(10, 'Document text must be at least 10 characters').max(15000, 'Document text exceeds 15,000 character limit'),
  domainHint: z.nativeEnum(LegalDomain).optional(),
  jurisdiction: z.string().default('General US'),
  maxIterations: z.number().int().min(1).max(3).default(3),
}).strict();

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;

// The closed-loop endpoint also needs location data for legal-aid matching.
// Extending the shared analysis schema prevents Zod from silently stripping it.
export const LoopExecutionRequestSchema = AnalysisRequestSchema.extend({
  state: z.string().trim().toUpperCase().length(2, 'State must be a 2-letter postal code (e.g. CA, NY, TX)').optional(),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be a 5-digit number').optional(),
}).strict();

export type LoopExecutionRequest = z.infer<typeof LoopExecutionRequestSchema>;

// 3. Legal Aid Matcher Request Schema
export const LegalAidRequestSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  state: z.string().trim().toUpperCase().length(2, 'State must be 2 characters (e.g., CA)'),
  domain: z.nativeEnum(LegalDomain).optional(),
  annualHouseholdIncome: z.number().min(0).optional(),
  householdSize: z.number().int().min(1).max(15).optional(),
}).strict();

export type LegalAidRequest = z.infer<typeof LegalAidRequestSchema>;

// 4. Pro Se Letter Builder Schema
export const ProSeLetterRequestSchema = z.object({
  templateType: z.enum([
    'SECURITY_DEPOSIT_RETURN',
    'HABITABILITY_REPAIR_DEMAND',
    'UNPAID_WAGES_DEMAND',
    'FDCPA_DEBT_VALIDATION',
  ]),
  senderName: z.string().trim().min(2).max(120),
  senderAddress: z.string().trim().min(5).max(300),
  recipientName: z.string().trim().min(2).max(120),
  recipientAddress: z.string().trim().min(5).max(300),
  rentalOrWorkplaceAddress: z.string().trim().max(300).optional(),
  disputedAmount: z.number().positive().optional(),
  incidentDate: z.string().trim().max(80).optional(),
  additionalContext: z.string().max(2000).optional(),
}).strict();

export type ProSeLetterRequest = z.infer<typeof ProSeLetterRequestSchema>;
