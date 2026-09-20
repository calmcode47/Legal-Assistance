/**
 * JurisAccess AI - PII Scrubber Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { PIIScrubber } from '../src/guardrails/piiScrubber';

describe('PIIScrubber (Two-Way Redaction & Re-hydration)', () => {
  it('should redact Social Security Numbers correctly', () => {
    const raw = 'My tenant SSN is 123-45-6789 and landlord SSN is 987-65-4321.';
    const { sanitizedText, tokenMap, detectedCount } = PIIScrubber.sanitize(raw);

    expect(sanitizedText).not.toContain('123-45-6789');
    expect(sanitizedText).not.toContain('987-65-4321');
    expect(sanitizedText).toContain('{{PII_SSN_1}}');
    expect(sanitizedText).toContain('{{PII_SSN_2}}');
    expect(detectedCount).toBe(2);

    const restored = PIIScrubber.detokenize(sanitizedText, tokenMap);
    expect(restored).toBe(raw);
  });

  it('should redact phone numbers and email addresses', () => {
    const raw = 'Contact tenant at (555) 234-5678 or via email at elena.gomez@example.org immediately.';
    const { sanitizedText, tokenMap } = PIIScrubber.sanitize(raw);

    expect(sanitizedText).not.toContain('(555) 234-5678');
    expect(sanitizedText).not.toContain('elena.gomez@example.org');
    expect(sanitizedText).toContain('{{PII_PHONE_1}}');
    expect(sanitizedText).toContain('{{PII_EMAIL_1}}');

    const restored = PIIScrubber.detokenize(sanitizedText, tokenMap);
    expect(restored).toBe(raw);
  });

  it('should redact street addresses accurately', () => {
    const raw = 'The rental premises located at 742 Evergreen Terrace Apt 4B are uninhabitable.';
    const { sanitizedText, tokenMap } = PIIScrubber.sanitize(raw);

    expect(sanitizedText).not.toContain('742 Evergreen Terrace Apt 4B');
    expect(sanitizedText).toContain('{{PII_ADDRESS_1}}');

    const restored = PIIScrubber.detokenize(sanitizedText, tokenMap);
    expect(restored).toBe(raw);
  });

  it('should redact Aadhaar numbers and dates of birth', () => {
    const raw =
      'Applicant Aadhaar 2345 6789 0123 and DOB 03/15/1990 applied for housing assistance.';
    const { sanitizedText, tokenMap, detectedCount } = PIIScrubber.sanitize(raw);

    expect(sanitizedText).not.toContain('2345 6789 0123');
    expect(sanitizedText).not.toContain('03/15/1990');
    expect(sanitizedText).toContain('{{PII_AADHAAR_1}}');
    expect(sanitizedText).toContain('{{PII_DOB_1}}');
    expect(detectedCount).toBeGreaterThanOrEqual(2);

    const restored = PIIScrubber.detokenize(sanitizedText, tokenMap);
    expect(restored).toBe(raw);
  });

  it('should return identical text if no PII is present', () => {
    const raw = 'This notice demands payment of past due rent under the Uniform Residential Landlord and Tenant Act.';
    const { sanitizedText, detectedCount } = PIIScrubber.sanitize(raw);

    expect(sanitizedText).toBe(raw);
    expect(detectedCount).toBe(0);
  });
});
