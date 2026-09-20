/**
 * Pure offline educational simulations.
 * Used only when the live API is unreachable — no network calls.
 */

import type {
  AnalysisRequest,
  ExplainerDraft,
  LegalAidData,
  LegalAidRequest,
  LegalDomainType,
  LoopExecutionReceipt,
  LoopRequest,
  ProSeLetterData,
  ProSeLetterRequest,
  TriageRequest,
  TriageResult,
  UrgencyLevelType,
} from './api';

function getDefaultNextSteps(domain: LegalDomainType, urgency: UrgencyLevelType): string[] {
  if (urgency === 'CRITICAL') {
    return [
      'Document all communications, notices, or lockout attempts with date/timestamp photos immediately.',
      'Check the deadline and response instructions printed on the notice or the official court website.',
      'Contact local legal aid or call 211 promptly to discuss the deadline and available options.',
    ];
  }
  if (domain === 'EMPLOYMENT_AND_LABOR') {
    return [
      'Gather pay stubs, schedules, timesheets, and written workplace communications.',
      'Consider asking a legal-aid clinic which wage-protection rules apply to your role and location.',
      'Use the official state labor-agency or federal Department of Labor website to review filing options.',
    ];
  }
  if (domain === 'CONSUMER_AND_DEBT') {
    return [
      'Keep the original collection notice and record the date you received it.',
      'Review official consumer-protection guidance or legal aid to see whether a validation request is timely.',
      'Ask a consumer legal-aid clinic about your state’s applicable limitations period and court deadlines.',
    ];
  }
  return [
    'Document all verbal conversations in writing and preserve physical notices in a secure file.',
    'Review official state or local legal-aid resources that apply to your location.',
    'Prepare the notice and supporting documents for a legal-aid intake appointment.',
  ];
}

export function offlineTriage(payload: TriageRequest): TriageResult {
  const lower = payload.query.toLowerCase();
  const isUrgent =
    lower.includes('3-day') ||
    lower.includes('lockout') ||
    lower.includes('evict') ||
    lower.includes('quit') ||
    lower.includes('sheriff');
  const isWage = lower.includes('wage') || lower.includes('overtime') || lower.includes('paycheck');
  const isDebt = lower.includes('debt') || lower.includes('collector') || lower.includes('collections');
  const isFamily = lower.includes('custody') || lower.includes('domestic') || lower.includes('restraining');

  let domain: LegalDomainType = payload.domainHint || 'TENANCY_AND_HOUSING';
  let urgency: UrgencyLevelType = isUrgent ? 'CRITICAL' : 'HIGH';
  let reasoning = isUrgent
    ? 'An urgent housing notice may have a short response deadline. Verify the notice instructions with legal aid or the court.'
    : 'An active civil dispute may require a prompt procedural response. Common identifiers are redacted before model processing.';

  if (isWage || payload.domainHint === 'EMPLOYMENT_AND_LABOR') {
    domain = 'EMPLOYMENT_AND_LABOR';
    urgency = 'HIGH';
    reasoning =
      'A wage or overtime concern was detected. Eligibility and filing deadlines depend on the worker’s role and location.';
  } else if (isDebt || payload.domainHint === 'CONSUMER_AND_DEBT') {
    domain = 'CONSUMER_AND_DEBT';
    urgency = 'MEDIUM';
    reasoning =
      'A third-party debt collection concern was detected. Official guidance or legal aid can confirm any applicable response window.';
  } else if (isFamily || payload.domainHint === 'FAMILY_AND_DOMESTIC') {
    domain = 'FAMILY_AND_DOMESTIC';
    urgency = 'HIGH';
    reasoning = 'Family or domestic matter detected. If unsafe, call 911 or 1-800-799-7233.';
  } else if (payload.domainHint === 'TENANCY_AND_HOUSING' || isUrgent) {
    domain = 'TENANCY_AND_HOUSING';
  }

  return {
    detectedDomain: domain,
    confidenceScore: 0.92,
    urgencyLevel: urgency,
    urgencyReasoning: reasoning,
    statutoryDeadlineAlert: isUrgent
      ? 'A short deadline or lockout concern may be present. Preserve the notice and get local legal-aid or court information promptly.'
      : undefined,
    emergencyHotlinesTriggered: isUrgent,
    recommendedNextModule: isUrgent
      ? 'EMERGENCY_HOTLINE'
      : domain === 'CONSUMER_AND_DEBT'
        ? 'AID_LOCATOR'
        : domain === 'TENANCY_AND_HOUSING' || domain === 'EMPLOYMENT_AND_LABOR'
          ? 'DEMYSTIFIER'
          : 'RIGHTS_NAVIGATOR',
    nextSteps: getDefaultNextSteps(domain, urgency),
    disclaimer:
      'Offline educational simulation — not live LLM analysis. JurisAccess AI is an automated educational tool designed to assist self-represented litigants. It does not provide formal legal counsel or create an attorney-client relationship.',
  };
}

export function offlineAnalyze(payload: AnalysisRequest): ExplainerDraft {
  const lower = `${payload.documentText} ${payload.domainHint || ''}`.toLowerCase();
  const isWage =
    payload.domainHint === 'EMPLOYMENT_AND_LABOR' ||
    lower.includes('wage') ||
    lower.includes('overtime') ||
    lower.includes('paycheck');
  const isDebt =
    payload.domainHint === 'CONSUMER_AND_DEBT' ||
    lower.includes('debt') ||
    lower.includes('collector') ||
    lower.includes('fdcpa');

  if (isWage) {
    return {
      iterationNumber: 1,
      plainLanguageSummary:
        'This looks like a wage or overtime dispute. In plain language, your employer may owe unpaid pay under the Fair Labor Standards Act. Keep timesheets and pay stubs, then file a wage claim if needed.',
      readingGradeLevel: 6.2,
      predatoryClauses: [
        {
          clauseId: 'CLAUSE-WAGE-01',
          lineNumber: 1,
          originalText: 'Employee agrees overtime is unpaid unless pre-approved in writing by management.',
          plainMeaning: 'The employer is trying to avoid paying overtime that federal law may require.',
          riskTier: 'RED_PREDATORY',
          statutoryDefect: 'Overtime waivers are generally unenforceable under FLSA, 29 U.S.C. § 207.',
          recommendedAction: 'Document hours worked and send a written unpaid-wages demand before filing a labor claim.',
        },
      ],
      assertableRights: [
        {
          rightName: 'Fair Labor Standards Act Overtime Protections',
          citation: '29 U.S.C. § 207',
          jurisdiction: payload.jurisdiction || 'Federal / State Labor Code',
          plainDescription: 'Covered non-exempt workers generally must receive overtime pay for hours over 40 in a workweek.',
          howToAssert: 'Calculate unpaid hours from timesheets and file with the state Labor Commissioner or DOL.',
        },
      ],
      actionChecklist: [
        '1. Gather pay stubs, timesheets, and offer letters.',
        '2. Send a formal unpaid-wages demand via Certified Mail.',
        '3. File a wage claim with your state labor agency if unpaid.',
        '4. Contact a free employment legal aid clinic for intake.',
      ],
      disclaimer: 'Offline educational simulation — not live LLM analysis. Not formal legal counsel.',
    };
  }

  if (isDebt) {
    return {
      iterationNumber: 1,
      plainLanguageSummary:
        'This looks like a debt collection notice. Under federal law, you usually have 30 days to dispute the debt in writing and ask for proof.',
      readingGradeLevel: 6.3,
      predatoryClauses: [
        {
          clauseId: 'CLAUSE-DEBT-01',
          lineNumber: 1,
          originalText: 'Failure to pay within 48 hours will result in immediate arrest and wage garnishment.',
          plainMeaning: 'The collector is using scare language. Civil debt collectors cannot order your arrest.',
          riskTier: 'RED_PREDATORY',
          statutoryDefect: 'Threats of arrest for consumer debt may violate FDCPA, 15 U.S.C. § 1692e.',
          recommendedAction: 'Send a written debt validation request within 30 days and keep a copy.',
        },
      ],
      assertableRights: [
        {
          rightName: 'Fair Debt Collection Practices Act Validation Rights',
          citation: '15 U.S.C. § 1692g',
          jurisdiction: 'Federal',
          plainDescription: 'You generally may dispute a debt in writing within 30 days of the first notice.',
          howToAssert: 'Mail a validation demand by Certified Mail and retain the receipt.',
        },
      ],
      actionChecklist: [
        '1. Calendar the 30-day validation window from the notice date.',
        '2. Send a written dispute and validation request.',
        '3. Stop verbal negotiations until you receive verification.',
        '4. Contact a consumer legal-aid clinic if sued.',
      ],
      disclaimer: 'Offline educational simulation — not live LLM analysis. Not formal legal counsel.',
    };
  }

  return {
    iterationNumber: 1,
    plainLanguageSummary:
      'This looks like a housing or lease dispute. In plain language, some clauses may conflict with tenant-protection rules. Keep photos and written notices, then ask legal aid about next steps.',
    readingGradeLevel: 6.1,
    predatoryClauses: [
      {
        clauseId: 'CLAUSE-HOUSING-01',
        lineNumber: 42,
        originalText:
          'Tenant hereby unconditionally waives all statutory rights under Civil Code Section 1942. Landlord reserves the unfettered right to enter at any hour without prior notice.',
        plainMeaning:
          'The lease tries to erase your legal protections and lets the landlord enter whenever they want.',
        riskTier: 'RED_PREDATORY',
        statutoryDefect:
          'WAIVER OF TENANT RIGHTS (Civil Code § 1953) and PRIVACY ENTRY VIOLATION (Civil Code § 1954). Mandatory tenant protections cannot be waived; non-emergency entry requires advance notice.',
        recommendedAction:
          'Do not rely on the waiver. Document conditions, send written notice asserting habitability rights, and contact legal aid.',
      },
    ],
    assertableRights: [
      {
        rightName: 'Implied Warranty of Habitability',
        citation: 'URLTA § 2.104 / Cal. Civ. Code § 1941.1',
        jurisdiction: payload.jurisdiction || 'State Civil Code',
        plainDescription:
          'Every residential tenant has a mandatory legal right to safe, clean running water, heat, and weatherproofing.',
        howToAssert: 'Document all physical defects with dated photos and serve a formal written Repair Demand Notice.',
      },
    ],
    actionChecklist: [
      '1. Review each highlighted clause against the statutory defect notes above.',
      '2. Send a formal written response or repair demand via Certified Mail.',
      '3. Retain copies of all signed documents and communications.',
      '4. Consult a verified pro bono legal aid organization before signing forfeiture.',
    ],
    disclaimer: 'Offline educational simulation — not live LLM analysis. Not formal legal counsel.',
  };
}

export function offlineMatchAid(payload: LegalAidRequest): LegalAidData {
  const income = payload.annualHouseholdIncome ?? 24000;
  const household = payload.householdSize ?? 3;
  const fplThreshold = 15060 + (household - 1) * 5380;
  const fplRatio = Math.round((income / fplThreshold) * 100);

  return {
    zipCode: payload.zipCode,
    state: payload.state,
    estimatedFplPercentage: fplRatio,
    isEligibleForFreeLegalAid: fplRatio <= 200,
    clinics: [
      {
        id: 'CLINIC_CA_01',
        name: 'Legal Aid Foundation of Los Angeles (LAFLA)',
        jurisdiction: 'California',
        state: payload.state || 'CA',
        zipCodesServed: ['90001', '90012', '90015', '90017', '90026', '90291'],
        practiceAreas: ['TENANCY_AND_HOUSING', 'EMPLOYMENT_AND_LABOR', 'FAMILY_AND_DOMESTIC'],
        incomeLimitFplPercentage: 200,
        phone: '(800) 399-4529',
        address: '1550 W 8th St, Los Angeles, CA 90017',
        website: 'https://lafla.org',
        walkInHours: 'Mon-Thu 9:00 AM - 12:00 PM',
        isLscFunded: true,
      },
      {
        id: 'CLINIC_NAT_01',
        name: 'National Legal Aid & Defender Association (NLADA Referral)',
        jurisdiction: 'National',
        state: 'US',
        zipCodesServed: [],
        practiceAreas: ['TENANCY_AND_HOUSING', 'EMPLOYMENT_AND_LABOR', 'CONSUMER_AND_DEBT'],
        incomeLimitFplPercentage: 200,
        phone: '2-1-1',
        address: 'National Referral Network / LawHelp.org',
        website: 'https://www.lawhelp.org',
        walkInHours: 'Online 24/7 Portal',
        isLscFunded: true,
      },
    ],
    intakeChecklist: {
      eligibilityOverview: `Under LSC guidelines, free legal aid is generally available for households earning up to 125%-200% of the Federal Poverty Level. Your household is at ~${fplRatio}% FPL.`,
      recommendedDocuments: [
        'Original copy of notice to vacate or eviction summons',
        'Signed lease agreement, renewal letters, or house rules',
        'Proof of rent payments (bank statements, money order receipts, canceled checks)',
        'Proof of household income (most recent paystub, W2, or benefit award letter)',
        'Photographs of any uninhabitable conditions with dates recorded',
      ],
      intakeQuestionsToExpect: [
        'What exact date was the notice or summons served?',
        'What is the total disputed dollar amount claimed?',
        'Has the opposing party initiated formal court proceedings?',
      ],
      urgencyNote: 'Contact the clinic as early as possible during morning intake hours.',
    },
  };
}

export function offlineCognitiveLoop(payload: LoopRequest): LoopExecutionReceipt {
  const mockAnalysis = offlineAnalyze({
    documentText: payload.documentText,
    domainHint: payload.domainHint,
    jurisdiction: payload.jurisdiction,
  });
  const mockTriage = offlineTriage({
    query: payload.documentText.slice(0, 500),
    state: payload.state || 'CA',
    zipCode: payload.zipCode || '90012',
    domainHint: payload.domainHint,
  });
  const mockAid = offlineMatchAid({
    zipCode: payload.zipCode || '90012',
    state: payload.state || 'CA',
    domain: payload.domainHint || mockTriage.detectedDomain,
  });

  return {
    sessionId: 'LEXIS_LOOP_OFFLINE',
    totalIterations: 1,
    iterations: 1,
    converged: true,
    status: 'converged',
    finalAuditScore: 95,
    score: 95,
    triage: mockTriage,
    verifiedAnalysis: mockAnalysis,
    output: {
      plainLanguage: mockAnalysis.plainLanguageSummary,
      clauses: mockAnalysis.predatoryClauses,
    },
    lastCriticFeedback: '',
    recommendedClinics: mockAid.clinics,
    executionTimeMs: 12,
    timestamp: new Date().toISOString(),
  };
}

export function offlineProSeLetter(payload: ProSeLetterRequest): ProSeLetterData {
  const dateStr =
    payload.incidentDate ||
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const amountStr = payload.disputedAmount ? `$${payload.disputedAmount.toFixed(2)}` : '$1,850.00';

  let formalCitation = 'California Civil Code § 1950.5 (Security Deposit Return & Bad Faith Retention)';
  let statutoryDeadlineDays = 21;

  if (payload.templateType === 'HABITABILITY_REPAIR_DEMAND') {
    formalCitation = 'Civil Code § 1941.1 & § 1942 (Implied Warranty of Habitability)';
    statutoryDeadlineDays = 14;
  } else if (payload.templateType === 'UNPAID_WAGES_DEMAND') {
    formalCitation = 'Fair Labor Standards Act (FLSA 29 U.S.C. § 201) & State Labor Code';
    statutoryDeadlineDays = 7;
  } else if (payload.templateType === 'FDCPA_DEBT_VALIDATION') {
    formalCitation = 'Fair Debt Collection Practices Act (FDCPA 15 U.S.C. § 1692g)';
    statutoryDeadlineDays = 30;
  }

  let additionalContext = payload.additionalContext || '';
  if (payload.includeTrebleDamages && !additionalContext.includes('Treble Damages')) {
    additionalContext =
      `Notice of Bad Faith Penalties: Under applicable statutory law, bad faith retention may subject the respondent to statutory punitive damages.\n${additionalContext}`.trim();
  }

  let letterBody = `DEMAND FOR IMMEDIATE RETURN OF RESIDENTIAL SECURITY DEPOSIT

VIA CERTIFIED MAIL — RETURN RECEIPT REQUESTED
Date: ${dateStr}

TO:
${payload.recipientName}
${payload.recipientAddress}

FROM:
${payload.senderName}
${payload.senderAddress}

RE: TENANCY TERMINATION AND STATUTORY DEMAND FOR IMMEDIATE RETURN OF FULL SECURITY DEPOSIT
Premises: ${payload.rentalOrWorkplaceAddress || 'Subject Rental Premises'}
Disputed Sum: ${amountStr}

Dear ${payload.recipientName},

Please be advised that pursuant to ${formalCitation}, a landlord is statutorily mandated to furnish a departing tenant with either a full refund of their security deposit or an itemized written accounting within ${statutoryDeadlineDays} calendar days following surrender of the premises.

My tenancy at the above-referenced premises was officially concluded on or about ${dateStr}. To date, more than ${statutoryDeadlineDays} days have elapsed, and I have received neither my deposit of ${amountStr} nor any itemized statement.

DEMAND IS HEREBY FORMALLY MADE for the immediate return of the entire security deposit balance of ${amountStr} within ten (10) calendar days of your receipt of this notice.

${payload.includeTrebleDamages ? `Please further note that under statutory bad faith retention rules, a landlord who retains a deposit in bad faith may be subject to statutory punitive damages.` : ''}

If payment in full is not received within ten (10) calendar days, I reserve all rights to file a civil action in Small Claims Court without further notice.

Sincerely,

__________________________________________
${payload.senderName}
Pro Se Tenant`;

  if (payload.templateType === 'HABITABILITY_REPAIR_DEMAND') {
    letterBody = `FORMAL NOTICE OF HABITABILITY DEFECTS AND DEMAND FOR IMMEDIATE REPAIRS

Date: ${dateStr}
TO: ${payload.recipientName}
${payload.recipientAddress}

FROM: ${payload.senderName}
${payload.senderAddress}

Premises: ${payload.rentalOrWorkplaceAddress || payload.senderAddress}

Pursuant to the statutory Implied Warranty of Habitability (${formalCitation}), landlords must maintain residential rental dwellings in a condition fit for human occupancy.

The premises suffer from the following substantial health and safety defects:
${additionalContext || '- Inoperative heating / lack of hot water supplies\n- Unaddressed water intrusion and visible mold growth'}

DEMAND IS HEREBY MADE that substantial remediation commence within ${statutoryDeadlineDays} calendar days.

Sincerely,
__________________________________________
${payload.senderName}`;
  } else if (payload.templateType === 'UNPAID_WAGES_DEMAND') {
    letterBody = `FORMAL DEMAND FOR PAYMENT OF OVERDUE WAGES

Date: ${dateStr}
TO: ${payload.recipientName}
${payload.recipientAddress}

FROM: ${payload.senderName}
${payload.senderAddress}

RE: FORMAL DEMAND FOR UNPAID WAGES
Disputed Gross Wages: ${amountStr}

Pursuant to ${formalCitation}, employers are required to pay all earned wages promptly. To date, the amount of ${amountStr} remains overdue.
${additionalContext ? `Details: ${additionalContext}\n` : ''}
Demand is made that full payment be remitted within ${statutoryDeadlineDays} business days.

Sincerely,
__________________________________________
${payload.senderName}`;
  } else if (payload.templateType === 'FDCPA_DEBT_VALIDATION') {
    letterBody = `DISPUTE AND DEBT VALIDATION DEMAND PURSUANT TO FDCPA 15 U.S.C. § 1692g

Date: ${dateStr}
TO: ${payload.recipientName}
${payload.recipientAddress}

FROM: ${payload.senderName}
${payload.senderAddress}

RE: DISPUTE OF ALLEGED DEBT (${amountStr})

Please be advised that I dispute the validity of the alleged debt of ${amountStr} in its entirety. Pursuant to the Fair Debt Collection Practices Act (15 U.S.C. § 1692g), you are required to cease all collection attempts until you furnish verified documentation of this alleged obligation.
${additionalContext ? `Reference: ${additionalContext}\n` : ''}
All further communications must be conducted exclusively in writing sent to my address above.

Sincerely,
__________________________________________
${payload.senderName}`;
  }

  return {
    templateType: payload.templateType,
    formalCitation,
    statutoryDeadlineDays,
    letterText: letterBody,
    certifiedMailInstructions: [
      'Print two copies of this letter (one to send, one for your records).',
      'Take the letter to any U.S. Post Office branch and request Certified Mail with Return Receipt (Green Card PS Form 3811).',
      'Affix the 20-digit USPS tracking barcode to your sender copy.',
      'Retain the stamped postal receipt and physical green card delivery signature as primary evidence for court.',
    ],
  };
}
