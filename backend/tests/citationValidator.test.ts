/**
 * JurisAccess AI - Citation & Grounding Validator Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { CitationValidator } from '../src/guardrails/citationValidator';

describe('CitationValidator Anti-Hallucination Engine', () => {
  it('detects and rejects hallucinated placeholders and fake precedents', () => {
    const textWithPlaceholder = 'Landlord must give notice pursuant to [citation needed].';
    const audit1 = CitationValidator.validate(textWithPlaceholder);
    expect(audit1.isValid).toBe(false);
    expect(audit1.flaggedCitations).toContain('[citation needed]');

    const textWithFakePrecedent = 'As established in Smith v. FakePrecedent, landlords cannot lock doors.';
    const audit2 = CitationValidator.validate(textWithFakePrecedent);
    expect(audit2.isValid).toBe(false);
    expect(audit2.flaggedCitations.length).toBeGreaterThan(0);

    const textWithFakeSection = 'This violates Section 99999 of the state code.';
    const audit3 = CitationValidator.validate(textWithFakeSection);
    expect(audit3.isValid).toBe(false);
  });

  it('passes clean documents with verified statutory references', () => {
    const cleanText = 'Pursuant to Cal. Civil Code § 1950.5 and URLTA § 2.104, habitability is mandatory.';
    const audit = CitationValidator.validate(cleanText);
    expect(audit.isValid).toBe(true);
    expect(audit.flaggedCitations.length).toBe(0);
  });

  it('extracts recognized statutory citations accurately', () => {
    const legalText = 'Protected under 15 U.S.C. § 1692g and Cal. Civil Code § 1941.1.';
    const citations = CitationValidator.extractRecognizedCitations(legalText);
    expect(citations.some((c) => c.includes('15 U.S.C. § 1692g'))).toBe(true);
    expect(citations.some((c) => c.includes('Cal. Civil Code § 1941.1'))).toBe(true);
  });
});
