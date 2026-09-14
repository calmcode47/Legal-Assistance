/**
 * JurisAccess AI - Two-Way PII Sanitization Engine
 * Redacts personal identifying information (SSN, phones, emails, addresses, credit cards)
 * before LLM inference, and safely re-hydrates tokens for user-facing responses.
 */

import { SanitizedInput, PIIMappingTable } from '../types/agent';

interface PIIPattern {
  type: string;
  regex: RegExp;
}

const PII_PATTERNS: PIIPattern[] = [
  // Social Security Numbers (SSN) & Tax IDs
  { type: 'SSN', regex: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g },
  // Credit Card Numbers
  { type: 'CREDIT_CARD', regex: /\b(?:\d{4}[- ]?){3}\d{4}\b/g },
  // Email Addresses
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g },
  // US & International Phone Numbers
  { type: 'PHONE', regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
  // Street Addresses (e.g. 123 Main St, Apt 4B)
  { type: 'ADDRESS', regex: /\b\d{1,5}\s+[A-Za-z0-9\s.,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Apt|Unit|Suite|Ste)\b/gi },
  // Dollar amounts with high specific precision (e.g. $1,420.50)
  { type: 'FINANCIAL_AMOUNT', regex: /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b/g },
];

export class PIIScrubber {
  /**
   * Redacts sensitive PII from untrusted input text and returns sanitized text + token map
   */
  public static sanitize(text: string): SanitizedInput {
    let sanitized = text;
    const tokenMap: PIIMappingTable = {};
    let detectedCount = 0;

    for (const pattern of PII_PATTERNS) {
      let matchIndex = 1;
      sanitized = sanitized.replace(pattern.regex, (match) => {
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

  /**
   * Re-hydrates tokens in the generated response with their original values
   */
  public static detokenize(sanitizedText: string, tokenMap: PIIMappingTable): string {
    if (!sanitizedText || typeof sanitizedText !== 'string') {
      return sanitizedText || '';
    }
    let result = sanitizedText;
    for (const [token, originalValue] of Object.entries(tokenMap)) {
      // Escape special regex characters in the token
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedToken, 'g'), originalValue);
    }
    return result;
  }
}
