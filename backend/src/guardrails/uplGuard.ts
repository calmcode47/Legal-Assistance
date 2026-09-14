/**
 * JurisAccess AI - Unauthorized Practice of Law (UPL) & Ethics Guardrail
 * Enforces ABA Model Rule compliance and injects mandatory educational disclaimers & crisis hotlines.
 */

export const STANDARD_LEGAL_DISCLAIMER =
  'Notice: JurisAccess AI is an automated educational tool designed to assist self-represented litigants. It provides legal information and document demystification, not legal advice or formal court representation, and does not establish an attorney-client relationship. If facing an imminent court date or illegal lockout, consult a licensed attorney or contact your local legal aid clinic immediately.';

export const EMERGENCY_HOTLINES = {
  DOMESTIC_VIOLENCE: 'National Domestic Violence Hotline: 1-800-799-SAFE (7233) | SMS: Text "START" to 88788',
  TENANT_EMERGENCY: 'National Eviction Defense Hotline / Civil Legal Aid: Call 2-1-1 or visit LawHelp.org',
  CRISIS_TEXT: 'National Crisis Lifeline: Dial 988',
};

const PRESCRIPTIVE_UPL_PATTERNS = [
  /\bi\s+(advise|counsel)\s+you\s+to\b/i,
  /\bas\s+your\s+(attorney|lawyer)\b/i,
  /\byou\s+must\s+plead\s+guilty\b/i,
  /\bi\s+will\s+represent\s+you\b/i,
  /\bguaranteed\s+(court\s+victory|dismissal)\b/i,
];

const EMERGENCY_PATTERNS = [
  /\b(domestic\s+violence|abuse|abusive\s+partner|threatened\s+my\s+life|beaten)\b/i,
  /\b(sheriff\s+is\s+coming\s+today|locked\s+me\s+out|changed\s+the\s+locks|thrown\s+on\s+the\s+street)\b/i,
  /\b(deportation\s+officer|ice\s+raid|immediate\s+removal)\b/i,
];

export class UPLGuard {
  /**
   * Checks if an AI response contains prohibited prescriptive legal advice
   */
  public static hasUplInfractions(text: string): boolean {
    for (const pattern of PRESCRIPTIVE_UPL_PATTERNS) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Detects if an emergency situation requires immediate crisis escalation
   */
  public static isEmergency(text: string): boolean {
    for (const pattern of EMERGENCY_PATTERNS) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Injects appropriate disclaimers and emergency banners to the final response
   */
  public static wrapWithDisclaimers(content: string, isEmergencyDetected = false): string {
    let output = content;

    if (isEmergencyDetected) {
      output = `⚠️ CRITICAL EMERGENCY NOTICE:\n${EMERGENCY_HOTLINES.DOMESTIC_VIOLENCE}\n${EMERGENCY_HOTLINES.TENANT_EMERGENCY}\n\n---\n\n${output}`;
    }

    if (!output.includes('JurisAccess AI is an automated educational tool')) {
      output = `${output}\n\n---\n${STANDARD_LEGAL_DISCLAIMER}`;
    }

    return output;
  }
}
