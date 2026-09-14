/**
 * JurisAccess AI - Prompt Injection & Adversarial Attack Guardrail
 * Provides delimiter sandboxing, jailbreak vector scanning, and canary token leak detection.
 */

import crypto from 'crypto';

export interface InjectionCheckResult {
  isSafe: boolean;
  detectedThreat?: string;
}

const ADVERSARIAL_PATTERNS = [
  /\bignore\s+(all\s+)?(previous|prior)\s+instructions\b/i,
  /\bdisregard\s+(the\s+)?(system|above)\s+prompt\b/i,
  /\byou\s+are\s+now\s+(in\s+)?dan\s+mode\b/i,
  /\bjailbreak\b/i,
  /\b(print|reveal|show|display|output|dump)\s+(the\s+|your\s+)?(system\s+prompt|initial\s+prompt|hidden\s+prompt|instructions)\b/i,
  /\bbypass\s+(all\s+)?(legal\s+disclaimers|safety\s+filters)\b/i,
  /\bact\s+as\s+an\s+unrestricted\s+ai\b/i,
  /\bdeveloper\s+mode\s+enabled\b/i,
];

export class InjectionGuard {
  /**
   * Scans input for adversarial injection strings
   */
  public static scan(input: string): InjectionCheckResult {
    for (const pattern of ADVERSARIAL_PATTERNS) {
      if (pattern.test(input)) {
        return {
          isSafe: false,
          detectedThreat: `Adversarial instruction pattern matched: ${pattern.toString()}`,
        };
      }
    }
    return { isSafe: true };
  }

  /**
   * Generates a cryptographic canary token for prompt leakage defense
   */
  public static generateCanary(): string {
    return `CANARY_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  }

  /**
   * Validates that the model response does not leak the secret canary token
   */
  public static verifyCanaryIntegrity(response: string, canary: string): boolean {
    return !response.includes(canary);
  }

  /**
   * Quarantines untrusted text inside strict XML boundary tags
   */
  public static sandbox(content: string): string {
    return `<litigant_document_content>\n${content.trim()}\n</litigant_document_content>`;
  }
}
