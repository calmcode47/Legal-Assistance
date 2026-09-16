/**
 * JurisAccess AI - UPL Guardrail & Ethics Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { UPLGuard, STANDARD_LEGAL_DISCLAIMER } from '../src/guardrails/uplGuard';

describe('UPLGuard Guardrail Engine', () => {
  it('detects prescriptive legal advice infractions', () => {
    expect(UPLGuard.hasUplInfractions('I advise you to withhold rent immediately.')).toBe(true);
    expect(UPLGuard.hasUplInfractions('As your lawyer, I recommend filing tomorrow.')).toBe(true);
    expect(UPLGuard.hasUplInfractions('You must plead guilty to this misdemeanor.')).toBe(true);
    expect(UPLGuard.hasUplInfractions('I will represent you in civil court.')).toBe(true);
  });

  it('permits neutral, educational legal information', () => {
    const neutral = 'Under Civil Code § 1942, tenants may have the statutory right to repair and deduct.';
    expect(UPLGuard.hasUplInfractions(neutral)).toBe(false);

    const educational = 'Common legal standards in this jurisdiction typically require 24 hours written notice.';
    expect(UPLGuard.hasUplInfractions(educational)).toBe(false);
  });

  it('detects urgent life-safety emergencies', () => {
    expect(UPLGuard.isEmergency('My partner has been abusive and threatened my life.')).toBe(true);
    expect(UPLGuard.isEmergency('The sheriff is coming today and locked me out.')).toBe(true);
    expect(UPLGuard.isEmergency('Landlord changed the locks and put my property on the street.')).toBe(true);
    expect(UPLGuard.isEmergency('I received a routine lease renewal proposal.')).toBe(false);
  });

  it('wraps content with mandatory educational disclaimer and hotlines', () => {
    const raw = 'Here is your tenant rights overview.';
    const wrapped = UPLGuard.wrapWithDisclaimers(raw, false);
    expect(wrapped).toContain(STANDARD_LEGAL_DISCLAIMER);
    expect(wrapped).not.toContain('CRITICAL EMERGENCY NOTICE');

    const emergencyWrapped = UPLGuard.wrapWithDisclaimers(raw, true);
    expect(emergencyWrapped).toContain('CRITICAL EMERGENCY NOTICE');
    expect(emergencyWrapped).toContain('1-800-799-SAFE');
    expect(emergencyWrapped).toContain(STANDARD_LEGAL_DISCLAIMER);
  });
});
