/**
 * JurisAccess AI - Two-Way PII Sanitization Engine
 * Redacts personal identifying information before LLM inference,
 * and safely re-hydrates tokens for user-facing responses.
 */

import { SanitizedInput, PIIMappingTable } from '../types/agent';

interface PIIPattern {
  type: string;
  regex: RegExp;
}

const PII_PATTERNS: PIIPattern[] = [
  // Social Security Numbers (SSN) & Tax IDs
  { type: 'SSN', regex: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g },
  // Credit Card Numbers (16 digits — matched before 12-digit Aadhaar)
  { type: 'CREDIT_CARD', regex: /\b(?:\d{4}[- ]?){3}\d{4}\b/g },
  // Aadhaar (exactly 12 digits; negative lookahead avoids eating card numbers)
  { type: 'AADHAAR', regex: /(?<!\d)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?!\d)/g },
  // Dates of Birth (common US formats)
  {
    type: 'DOB',
    regex:
      /\b(?:(?:0?[1-9]|1[0-2])[\/\-.](?:0?[1-9]|[12]\d|3[01])[\/\-.](?:19|20)\d{2}|(?:19|20)\d{2}[\/\-.](?:0?[1-9]|1[0-2])[\/\-.](?:0?[1-9]|[12]\d|3[01])|(?:DOB|Date of Birth|Born)\s*[:\-]?\s*(?:0?[1-9]|1[0-2])[\/\-.](?:0?[1-9]|[12]\d|3[01])[\/\-.](?:19|20)\d{2})\b/gi,
  },
  // Email Addresses
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g },
  // US & International Phone Numbers
  { type: 'PHONE', regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
  // Street Addresses
  {
    type: 'ADDRESS',
    regex:
      /\b\d{1,5}\s+[A-Za-z0-9\s.,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Apt|Unit|Suite|Ste)\b/gi,
  },
];

export class PIIScrubber {
  public static sanitize(text: string): SanitizedInput {
    let sanitized = text;
    const tokenMap: PIIMappingTable = {};
    let detectedCount = 0;

    for (const pattern of PII_PATTERNS) {
      let matchIndex = 1;
      // Reset lastIndex for global/sticky regex reuse safety
      pattern.regex.lastIndex = 0;
      sanitized = sanitized.replace(pattern.regex, (match) => {
        // Avoid double-tokenizing already-replaced tokens
        if (match.includes('{{PII_')) return match;
        const token = `{{PII_${pattern.type}_${matchIndex++}}}`;
        tokenMap[token] = match;
        detectedCount++;
        return token;
      });
    }

    return {
      sanitizedText: sanitized,
      tokenMap,
      detectedCount,
    };
  }

  public static detokenize(sanitizedText: string, tokenMap: PIIMappingTable): string {
    if (!sanitizedText || typeof sanitizedText !== 'string') {
      return sanitizedText || '';
    }
    let result = sanitizedText;
    for (const [token, originalValue] of Object.entries(tokenMap)) {
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedToken, 'g'), originalValue);
    }
    return result;
  }
}
