import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LegalDomain, LegalDomainType } from '../services/api';

interface RightCard {
  id: string;
  title: string;
  citation: string;
  plain: string;
  assertHow: string;
  urgency: 'NOW' | 'SOON' | 'PLAN';
}

const RIGHTS_BY_DOMAIN: Record<string, RightCard[]> = {
  [LegalDomain.TENANCY_AND_HOUSING]: [
    {
      id: 'habitability',
      title: 'Safe and Livable Housing',
      citation: 'URLTA § 2.104 / Cal. Civ. Code § 1941.1',
      plain: 'Your rental must have heat, hot water, weatherproofing, and working sanitation. Landlords cannot leave homes unsafe.',
      assertHow: 'Take dated photos, write a repair demand, and send it by certified mail. Keep copies.',
      urgency: 'SOON',
    },
    {
      id: 'notice-entry',
      title: '24-Hour Entry Notice',
      citation: 'Cal. Civ. Code § 1954',
      plain: 'Except for true emergencies, landlords usually need advance written notice before entering.',
      assertHow: 'Reply in writing that you expect proper notice. Document any illegal entry attempts.',
      urgency: 'PLAN',
    },
    {
      id: 'deposit',
      title: 'Security Deposit Return Window',
      citation: 'Cal. Civ. Code § 1950.5',
      plain: 'After you move out, many states require deposit return or an itemized list within a short statutory window (often 21 days in California).',
      assertHow: 'Save move-out photos and send a written deposit demand if the deadline passes.',
      urgency: 'SOON',
    },
    {
      id: 'retaliation',
      title: 'Protection From Retaliatory Eviction',
      citation: 'Cal. Civ. Code § 1942.5',
      plain: 'Asking for repairs or asserting tenant rights should not trigger punishment like sudden eviction or rent hikes.',
      assertHow: 'Keep dated repair requests. Share them with legal aid if eviction follows quickly.',
      urgency: 'NOW',
    },
  ],
  [LegalDomain.EMPLOYMENT_AND_LABOR]: [
    {
      id: 'overtime',
      title: 'Overtime Pay Protections',
      citation: 'FLSA 29 U.S.C. § 207',
      plain: 'Covered non-exempt workers generally earn overtime after 40 hours in a workweek.',
      assertHow: 'Save timesheets and pay stubs. Write an unpaid-wages demand, then consider a labor claim.',
      urgency: 'SOON',
    },
    {
      id: 'minimum-wage',
      title: 'Minimum Wage Floor',
      citation: 'FLSA 29 U.S.C. § 206 / State Labor Codes',
      plain: 'Employers must pay at least the higher of federal or applicable state/local minimum wage.',
      assertHow: 'Compare pay stubs to the posted rate for your city or state. Ask legal aid about underpayment.',
      urgency: 'SOON',
    },
    {
      id: 'final-pay',
      title: 'Final Paycheck Timing',
      citation: 'State Labor Codes (varies)',
      plain: 'When employment ends, many states set strict deadlines for final wages.',
      assertHow: 'Note your last day worked and request unpaid wages in writing immediately.',
      urgency: 'NOW',
    },
  ],
  [LegalDomain.CONSUMER_AND_DEBT]: [
    {
      id: 'validation',
      title: 'Debt Validation Window',
      citation: 'FDCPA 15 U.S.C. § 1692g',
      plain: 'After the first collector notice, you usually have 30 days to dispute the debt in writing and demand proof.',
      assertHow: 'Send a validation letter by certified mail within 30 days. Keep the green card receipt.',
      urgency: 'NOW',
    },
    {
      id: 'no-threats',
      title: 'No Fake Arrest Threats',
      citation: 'FDCPA 15 U.S.C. § 1692e',
      plain: 'Collectors cannot threaten arrest or pretend to be police over ordinary consumer debt.',
      assertHow: 'Save texts, voicemails, and letters. Report abusive tactics to legal aid or the CFPB.',
      urgency: 'SOON',
    },
    {
      id: 'cease-contact',
      title: 'Written Cease-Contact Request',
      citation: 'FDCPA 15 U.S.C. § 1692c',
      plain: 'You can tell a collector in writing to stop contacting you except for specific limited notices.',
      assertHow: 'Send a short cease-contact letter and keep a copy with the mailing proof.',
      urgency: 'PLAN',
    },
  ],
  [LegalDomain.FAMILY_AND_DOMESTIC]: [
    {
      id: 'safety',
      title: 'Immediate Safety First',
      citation: 'National DV Hotline / Local Protective Orders',
      plain: 'If you are unsafe, getting to a safe place and calling emergency services comes before paperwork.',
      assertHow: 'Call 911 if in danger, or 1-800-799-7233 for confidential help planning next steps.',
      urgency: 'NOW',
    },
    {
      id: 'protective',
      title: 'Protective / Restraining Orders',
      citation: 'State Family / Domestic Violence Codes',
      plain: 'Courts can issue orders that limit contact and may help with temporary custody or housing access.',
      assertHow: 'Ask legal aid or a DV advocate how to file in your county court.',
      urgency: 'NOW',
    },
  ],
  [LegalDomain.CIVIL_RIGHTS_AND_IMMIGRATION]: [
    {
      id: 'discrimination',
      title: 'Housing and Workplace Discrimination Complaints',
      citation: 'Fair Housing Act / Title VII',
      plain: 'Discrimination based on protected characteristics can support formal complaints with agencies.',
      assertHow: 'Write down dates, witnesses, and statements. Contact legal aid before deadlines pass.',
      urgency: 'SOON',
    },
  ],
  [LegalDomain.GENERAL_CIVIL]: [
    {
      id: 'documentation',
      title: 'Document Everything',
      citation: 'General Civil Practice Guidance',
      plain: 'Courts and clinics rely on dates, notices, photos, and payment proof.',
      assertHow: 'Create a single folder with notices, photos, and a timeline of events.',
      urgency: 'PLAN',
    },
  ],
};

const DOMAIN_OPTIONS: { id: LegalDomainType; label: string; icon: string }[] = [
  { id: LegalDomain.TENANCY_AND_HOUSING, label: 'Housing & Eviction', icon: 'home' },
  { id: LegalDomain.EMPLOYMENT_AND_LABOR, label: 'Wages & Work', icon: 'badge' },
  { id: LegalDomain.CONSUMER_AND_DEBT, label: 'Debt Collection', icon: 'payments' },
  { id: LegalDomain.FAMILY_AND_DOMESTIC, label: 'Family Safety', icon: 'family_restroom' },
];

export const RightsNavigator: React.FC = () => {
  const navigate = useNavigate();
  const [domain, setDomain] = useState<LegalDomainType>(LegalDomain.TENANCY_AND_HOUSING);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const rights = useMemo(() => RIGHTS_BY_DOMAIN[domain] || RIGHTS_BY_DOMAIN[LegalDomain.GENERAL_CIVIL], [domain]);
  const completed = rights.filter((r) => checked[r.id]).length;

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <p
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--secondary)',
            marginBottom: '0.35rem',
          }}
        >
          Civil Rights Navigator
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
            color: 'var(--primary)',
            margin: '0 0 0.5rem',
            lineHeight: 1.15,
          }}
        >
          Know your rights before you act
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', maxWidth: '42rem', lineHeight: 1.55, margin: 0 }}>
          Pick your civil-legal situation. Review plain-language rights grounded in published statutes, check what
          applies to you, then route to document analysis, free clinics, or a demand letter.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Legal domain for rights guidance"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}
      >
        {DOMAIN_OPTIONS.map((opt) => {
          const active = domain === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-pressed={active}
              className={`btn ${active ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', minHeight: '44px' }}
              onClick={() => {
                setDomain(opt.id);
                setChecked({});
              }}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>
                {opt.icon}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>

      <div
        role="status"
        aria-live="polite"
        style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--surface-container)',
          borderLeft: '3px solid var(--secondary)',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        Progress: {completed} of {rights.length} rights reviewed
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 0, padding: 0 }}>
        {rights.map((right) => {
          const isChecked = Boolean(checked[right.id]);
          return (
            <li
              key={right.id}
              style={{
                backgroundColor: 'var(--surface-container-lowest)',
                border: '1px solid var(--outline-faint)',
                padding: '1rem 1.1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <input
                  id={`right-${right.id}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(right.id)}
                  style={{ width: '20px', height: '20px', marginTop: '0.2rem', accentColor: 'var(--secondary)' }}
                  aria-describedby={`right-desc-${right.id}`}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label
                      htmlFor={`right-${right.id}`}
                      style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                      {right.title}
                    </label>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.65rem',
                        backgroundColor:
                          right.urgency === 'NOW'
                            ? 'var(--emergency-bg)'
                            : right.urgency === 'SOON'
                              ? 'var(--surface-container-high)'
                              : 'var(--surface-container)',
                        color: right.urgency === 'NOW' ? 'var(--emergency-text)' : 'var(--on-surface-variant)',
                      }}
                    >
                      {right.urgency}
                    </span>
                  </div>
                  <p id={`right-desc-${right.id}`} style={{ margin: '0 0 0.5rem', lineHeight: 1.55, color: 'var(--on-surface)' }}>
                    {right.plain}
                  </p>
                  <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                    <strong>Citation:</strong> {right.citation}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <strong>How to assert:</strong> {right.assertHow}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          borderTop: '1px solid var(--outline-faint)',
          paddingTop: '1.25rem',
        }}
      >
        <button type="button" className="btn btn-primary" style={{ minHeight: '44px' }} onClick={() => navigate('/analyze')}>
          Analyze a Notice
        </button>
        <button type="button" className="btn btn-dark" style={{ minHeight: '44px' }} onClick={() => navigate('/aid')}>
          Find Free Legal Aid
        </button>
        <button type="button" className="btn btn-outline" style={{ minHeight: '44px' }} onClick={() => navigate('/action')}>
          Build Demand Letter
        </button>
        <button type="button" className="btn btn-outline" style={{ minHeight: '44px' }} onClick={() => navigate('/')}>
          Back to Triage
        </button>
      </div>

      <p
        role="note"
        style={{
          marginTop: '1.25rem',
          fontSize: '0.78rem',
          color: 'var(--on-surface-variant)',
          lineHeight: 1.5,
        }}
      >
        Educational information only — not legal advice and not an attorney-client relationship. Rules vary by state;
        verify with a licensed attorney or legal-aid clinic before acting.
      </p>
    </div>
  );
};

export default RightsNavigator;
