/**
 * JurisAccess AI - Triage & Urgency Agent
 * Classifies legal domain, evaluates emergency triggers, and identifies statutory deadlines.
 */

import { TriageResult } from '../types/agent';
import { UPLGuard } from '../guardrails/uplGuard';
import { LegalDomain, UrgencyLevel } from '../types/legal';

export class TriageAgent {
  /**
   * Evaluates citizen query and determines legal domain, urgency level, and routing.
   *
   * Triage is intentionally deterministic: it is the safety-critical ingress to
   * the system, must work during an LLM outage, and does not need to transmit a
   * citizen's narrative to a model merely to identify clear urgency signals.
   */
  public static async triage(
    userQuery: string,
    state?: string,
    _zipCode?: string,
    domainHint?: LegalDomain
  ): Promise<TriageResult> {
    const normalized = userQuery.toLowerCase();
    // Match complete words/phrases rather than arbitrary substrings. For
    // example, the letters "ice" in "notice" must not route an eviction
    // notice to immigration services.
    const hasAny = (...keywords: string[]) =>
      keywords.some((keyword) => {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(normalized);
      });
    const isEmergency =
      UPLGuard.isEmergency(userQuery) ||
      hasAny('3-day', 'three-day', '72 hour', 'sheriff', 'evict', 'eviction hearing', 'restraining order');

    const detectedDomain =
      domainHint ||
      (hasAny('wage', 'overtime', 'paycheck', 'employer', 'fired', 'workplace')
        ? LegalDomain.EMPLOYMENT_AND_LABOR
        : hasAny('debt', 'collector', 'collection', 'repossession', 'creditor')
          ? LegalDomain.CONSUMER_AND_DEBT
          : hasAny('custody', 'child support', 'domestic violence', 'protective order', 'abusive partner')
            ? LegalDomain.FAMILY_AND_DOMESTIC
            : hasAny('discrimination', 'immigration', 'asylum', 'police misconduct', 'ice')
              ? LegalDomain.CIVIL_RIGHTS_AND_IMMIGRATION
              : hasAny('lease', 'tenant', 'landlord', 'rent', 'housing', 'lockout')
                ? LegalDomain.TENANCY_AND_HOUSING
                : LegalDomain.GENERAL_CIVIL);

    const urgencyLevel = isEmergency
      ? UrgencyLevel.CRITICAL
      : detectedDomain === LegalDomain.EMPLOYMENT_AND_LABOR || detectedDomain === LegalDomain.FAMILY_AND_DOMESTIC
        ? UrgencyLevel.HIGH
        : detectedDomain === LegalDomain.GENERAL_CIVIL
          ? UrgencyLevel.LOW
          : UrgencyLevel.MEDIUM;

    const statutoryDeadlineAlert = isEmergency
      ? 'An immediate deadline or safety concern may be present. Preserve the notice and contact legal aid or emergency services now.'
      : detectedDomain === LegalDomain.CONSUMER_AND_DEBT
        ? 'A debt-validation notice may have a 30-day response window. Keep the original notice and its delivery date.'
        : detectedDomain === LegalDomain.EMPLOYMENT_AND_LABOR
          ? 'Preserve pay records, schedules, and written workplace communications because filing deadlines can apply.'
          : undefined;

    return {
      detectedDomain,
      confidenceScore: domainHint ? 0.99 : 0.9,
      urgencyLevel,
      urgencyReasoning: domainHint
        ? `Routed using the user's selected ${domainHint.replaceAll('_', ' ').toLowerCase()} context.`
        : `Routed from the civil-legal issue and urgency indicators in the submitted text${state ? ` for ${state.toUpperCase()}` : ''}.`,
      statutoryDeadlineAlert,
      emergencyHotlinesTriggered: isEmergency,
      recommendedNextModule: isEmergency
        ? 'EMERGENCY_HOTLINE'
        : detectedDomain === LegalDomain.TENANCY_AND_HOUSING || detectedDomain === LegalDomain.EMPLOYMENT_AND_LABOR
          ? 'DEMYSTIFIER'
          : detectedDomain === LegalDomain.CONSUMER_AND_DEBT
            ? 'AID_LOCATOR'
            : 'RIGHTS_NAVIGATOR',
    };
  }
}
