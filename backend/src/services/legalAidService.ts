/**
 * JurisAccess AI - Verified Legal Aid Directory & Pro Se Letter Generator
 * Matches low-income citizens with LSC-funded clinics and renders formal legal notices.
 */

import { LegalDomain, LegalAidClinic } from '../types/legal';
import { ProSeLetterRequest } from '../types/api';
import { CacheService } from './cacheService';

// Verified representative LSC & civil legal aid organizations
const VERIFIED_LEGAL_AID_CLINICS: LegalAidClinic[] = [
  {
    id: 'CLINIC_CA_01',
    name: 'Legal Aid Foundation of Los Angeles (LAFLA)',
    jurisdiction: 'California',
    state: 'CA',
    zipCodesServed: ['90001', '90012', '90015', '90017', '90026', '90291'],
    practiceAreas: [LegalDomain.TENANCY_AND_HOUSING, LegalDomain.EMPLOYMENT_AND_LABOR, LegalDomain.FAMILY_AND_DOMESTIC],
    incomeLimitFplPercentage: 200,
    phone: '(800) 399-4529',
    address: '1550 W 8th St, Los Angeles, CA 90017',
    website: 'https://lafla.org',
    walkInHours: 'Mon-Thu 9:00 AM - 12:00 PM',
    isLscFunded: true,
  },
  {
    id: 'CLINIC_CA_02',
    name: 'Bay Area Legal Aid (BayLegal)',
    jurisdiction: 'California',
    state: 'CA',
    zipCodesServed: ['94102', '94103', '94110', '94601', '94607', '94612'],
    practiceAreas: [LegalDomain.TENANCY_AND_HOUSING, LegalDomain.CONSUMER_AND_DEBT, LegalDomain.CIVIL_RIGHTS_AND_IMMIGRATION],
    incomeLimitFplPercentage: 200,
    phone: '(800) 551-5554',
    address: '1735 Telegraph Ave, Oakland, CA 94612',
    website: 'https://baylegal.org',
    walkInHours: 'Mon, Thu 9:30 AM - 3:00 PM',
    isLscFunded: true,
  },
  {
    id: 'CLINIC_NY_01',
    name: 'The Legal Aid Society of New York',
    jurisdiction: 'New York',
    state: 'NY',
    zipCodesServed: ['10001', '10007', '10025', '10451', '11201', '11211'],
    practiceAreas: [LegalDomain.TENANCY_AND_HOUSING, LegalDomain.EMPLOYMENT_AND_LABOR, LegalDomain.CONSUMER_AND_DEBT],
    incomeLimitFplPercentage: 200,
    phone: '(212) 577-3300',
    address: '199 Water St, New York, NY 10038',
    website: 'https://legalaidnyc.org',
    walkInHours: 'Mon-Fri 9:00 AM - 5:00 PM (Intake Line)',
    isLscFunded: true,
  },
  {
    id: 'CLINIC_TX_01',
    name: 'Lone Star Legal Aid',
    jurisdiction: 'Texas',
    state: 'TX',
    zipCodesServed: ['77002', '77004', '77006', '77019', '75701', '77301'],
    practiceAreas: [LegalDomain.TENANCY_AND_HOUSING, LegalDomain.CONSUMER_AND_DEBT, LegalDomain.FAMILY_AND_DOMESTIC],
    incomeLimitFplPercentage: 125,
    phone: '(800) 733-8394',
    address: '1415 Fannin St, Houston, TX 77002',
    website: 'https://lonestarlegal.org',
    walkInHours: 'Mon-Fri 8:30 AM - 5:00 PM',
    isLscFunded: true,
  },
  {
    id: 'CLINIC_NAT_01',
    name: 'National Legal Aid & Defender Association (NLADA Referral)',
    jurisdiction: 'National',
    state: 'US',
    zipCodesServed: [],
    practiceAreas: [LegalDomain.TENANCY_AND_HOUSING, LegalDomain.EMPLOYMENT_AND_LABOR, LegalDomain.CONSUMER_AND_DEBT],
    incomeLimitFplPercentage: 200,
    phone: '2-1-1',
    address: 'National Referral Network / LawHelp.org',
    website: 'https://www.lawhelp.org',
    walkInHours: 'Online 24/7 Portal',
    isLscFunded: true,
  },
];

/** Approximate 2024 HHS Federal Poverty Level (contiguous US) used for LSC screening. */
export function estimateFederalPovertyLevel(householdSize: number): number {
  const size = Math.max(1, Math.min(householdSize, 15));
  const base = 15060;
  const perAdditional = 5380;
  return base + (size - 1) * perAdditional;
}

export class LegalAidService {
  /**
   * Finds matching legal aid clinics based on zip code, state, domain, and optional income.
   * Ranking: exact ZIP → same-state domain match → national referral.
   * When income is provided, clinics whose FPL ceiling the household exceeds are deprioritized.
   */
  public static findClinics(params: {
    zipCode: string;
    state: string;
    domain?: LegalDomain;
    annualHouseholdIncome?: number;
    householdSize?: number;
  }): LegalAidClinic[] {
    const { zipCode, state, domain, annualHouseholdIncome, householdSize } = params;
    const cacheKey = `clinics:${state}:${zipCode}:${domain ?? 'ALL'}:${annualHouseholdIncome ?? 'NONE'}:${householdSize ?? 1}`;
    const cached = CacheService.get<LegalAidClinic[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const fpl =
      annualHouseholdIncome !== undefined
        ? estimateFederalPovertyLevel(householdSize ?? 1)
        : null;
    const fplRatio =
      fpl && annualHouseholdIncome !== undefined ? annualHouseholdIncome / fpl : null;

    const scored = VERIFIED_LEGAL_AID_CLINICS.map((clinic) => {
      const matchesZip = clinic.zipCodesServed.includes(zipCode);
      const matchesState = clinic.state === state;
      const isNational = clinic.state === 'US';
      const matchesDomain = !domain || clinic.practiceAreas.includes(domain);
      const incomeEligible =
        fplRatio === null ? true : fplRatio * 100 <= clinic.incomeLimitFplPercentage + 0.01;

      let score = 0;
      if (matchesZip && matchesDomain) score += 100;
      else if (matchesZip) score += 80;
      else if (matchesState && matchesDomain) score += 50;
      else if (matchesState) score += 30;
      else if (isNational && matchesDomain) score += 15;
      else if (isNational) score += 5;

      if (incomeEligible) score += 10;
      else score -= 20;

      if (clinic.isLscFunded) score += 5;

      const geographicallyRelevant = matchesZip || matchesState || isNational;
      return { clinic, score, geographicallyRelevant, matchesDomain };
    })
      .filter((row) => row.geographicallyRelevant && row.matchesDomain)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      const fallbackResult = [VERIFIED_LEGAL_AID_CLINICS[VERIFIED_LEGAL_AID_CLINICS.length - 1]];
      CacheService.set(cacheKey, fallbackResult, 3600000);
      return fallbackResult;
    }

    // Prefer ZIP-exact matches when available; otherwise return ranked state/national list.
    const zipExact = scored.filter((row) => row.clinic.zipCodesServed.includes(zipCode));
    const ranked = (zipExact.length > 0 ? zipExact : scored).map((row) => row.clinic);

    // Always append national referral as a last-resort option if not already present.
    const national = VERIFIED_LEGAL_AID_CLINICS[VERIFIED_LEGAL_AID_CLINICS.length - 1];
    if (!ranked.some((c) => c.id === national.id)) {
      ranked.push(national);
    }
    CacheService.set(cacheKey, ranked, 3600000);
    return ranked;
  }

  /**
   * Generates formatted Pro Se legal demand letters
   */
  public static generateProSeLetter(req: ProSeLetterRequest): string {
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const amountStr = req.disputedAmount ? `$${req.disputedAmount.toFixed(2)}` : 'the full statutory amount';

    switch (req.templateType) {
      case 'SECURITY_DEPOSIT_RETURN':
        return `
SENT VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED

Date: ${dateStr}

TO:
${req.recipientName}
${req.recipientAddress}

FROM:
${req.senderName}
${req.senderAddress}

RE: FORMAL DEMAND FOR RETURN OF SECURITY DEPOSIT
Premises: ${req.rentalOrWorkplaceAddress || '[Rental Address]'}

Dear ${req.recipientName},

I am writing to formally demand the return of my security deposit in the amount of ${amountStr}, paid in connection with my tenancy at the above-referenced premises which terminated on ${req.incidentDate || '[Move-Out Date]'}.

Under applicable state landlord-tenant law, a landlord must return the full security deposit along with an itemized statement of any lawful deductions within the statutory deadline (typically 14 to 30 days) following vacancy. To date, I have received neither my deposit nor an itemized accounting.

Please be advised that bad-faith retention of a tenant's security deposit may subject a landlord to statutory penalties, including double or treble damages plus court costs in Small Claims Court.

Please remit a check for the full amount of ${amountStr} to my current address listed above within ten (10) calendar days of receipt of this notice. If I do not receive payment by that date, I reserve all rights to initiate legal proceedings without further notice.

Sincerely,

_________________________________________
${req.senderName}
        `.trim();

      case 'HABITABILITY_REPAIR_DEMAND':
        return `
SENT VIA CERTIFIED MAIL & WRITTEN NOTICE

Date: ${dateStr}

TO:
${req.recipientName}
${req.recipientAddress}

FROM:
${req.senderName}
${req.senderAddress}

RE: NOTICE OF CONDITIONS IN NEED OF REPAIR - BREACH OF WARRANTY OF HABITABILITY
Premises: ${req.rentalOrWorkplaceAddress || '[Rental Address]'}

Dear ${req.recipientName},

Please be advised that the following defective conditions exist at the above-referenced premises, in violation of the Implied Warranty of Habitability and local housing safety codes:

${req.additionalContext || '1. Inadequate heat/hot water.\n2. Plumbing leaks causing unsanitary moisture.\n3. Defective locking mechanisms on exterior entrance doors.'}

Under statutory law and the Uniform Residential Landlord and Tenant Act, you have an affirmative legal duty to maintain the premises in a clean, safe, and habitable condition. 

I request that you commence necessary repairs within fourteen (14) days (or within 24 hours for emergency utility failures). If these conditions are not remedied promptly, I reserve all lawful tenant remedies, including reporting these violations to the local municipal code enforcement agency and exercising statutory rights.

Sincerely,

_________________________________________
${req.senderName}
        `.trim();

      case 'UNPAID_WAGES_DEMAND':
        return `
FORMAL DEMAND FOR PAYMENT OF UNPAID WAGES

Date: ${dateStr}

TO:
${req.recipientName}
${req.recipientAddress}

FROM:
${req.senderName}
${req.senderAddress}

RE: DEMAND FOR UNPAID WAGES AND STATUTORY COMPENSATION

Dear ${req.recipientName},

This letter constitutes a formal demand for payment of unpaid compensation earned during my employment with your organization. The total gross amount currently overdue is ${amountStr}.

${req.additionalContext || 'This includes unpaid standard hours and statutory overtime hours that have not been compensated.'}

Under the Fair Labor Standards Act (FLSA, 29 U.S.C. § 201 et seq.) and state labor codes, employers who fail to pay earned wages upon the statutory deadline may be held liable for the principal wages plus statutory liquidated damages, interest, and attorney fees.

Please remit payment in full within seven (7) business days. Failure to do so will result in the immediate filing of a formal wage claim with the State Labor Commissioner / Department of Labor.

Sincerely,

_________________________________________
${req.senderName}
        `.trim();

      case 'FDCPA_DEBT_VALIDATION':
        return `
SENT VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED

Date: ${dateStr}

TO:
${req.recipientName}
${req.recipientAddress}

FROM:
${req.senderName}
${req.senderAddress}

RE: DEBT VALIDATION NOTICE PURSUANT TO FDCPA 15 U.S.C. § 1692g
Alleged Account / Reference Number: ${req.additionalContext || '[Account Number]'}

Dear Debt Collector,

I am writing in response to your communication regarding an alleged debt of ${amountStr}. Please be advised that I am exercising my rights under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

I dispute the validity of this alleged debt in whole. Please provide formal verification and substantiation of this debt, including:
1. The name and address of the original creditor;
2. A full itemized accounting of the principal, interest, and fees;
3. Copy of the original written agreement bearing my signature;
4. Proof that your agency is licensed to collect debts in my state.

Until such validation is provided, you must cease all collection activities against me. All future communications must be conducted exclusively in writing via mail.

Sincerely,

_________________________________________
${req.senderName}
        `.trim();
    }
  }
}
