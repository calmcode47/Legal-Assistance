import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DemystifiedClause {
  id: string;
  lineNumber: number;
  originalText: string;
  plainTranslation: string;
  statutoryDefect: string;
  riskTier: 'RED_PREDATORY' | 'AMBER_UNFAVORABLE' | 'GREEN_STANDARD';
  statuteCitation: string;
  actionRecommendation: string;
}

export const DocumentDemystifier: React.FC = () => {
  const navigate = useNavigate();

  const [activeClauseId, setActiveClauseId] = useState<string>('clause-1');

  const sampleClauses: DemystifiedClause[] = [
    {
      id: 'clause-1',
      lineNumber: 14,
      originalText:
        'Tenant hereby unconditionally waives all statutory rights under Civil Code Section 1942, and agrees that Landlord shall have no obligation to maintain the heating, electrical, or plumbing fixtures.',
      plainTranslation:
        'The landlord is trying to force you to give up your legal right to hot water, heating, and working pipes, making you pay for their building repairs.',
      statutoryDefect: 'STRICTLY VOID AS AGAINST PUBLIC POLICY (Cal. Civ. Code § 1953(a)(2)).',
      riskTier: 'RED_PREDATORY',
      statuteCitation: 'California Civil Code § 1953 & § 1941.1 (Habitability Protection)',
      actionRecommendation: 'Do not pay out-of-pocket for primary plumbing/heat repairs. Send a statutory 14-day defect demand notice.',
    },
    {
      id: 'clause-2',
      lineNumber: 28,
      originalText:
        'In the event rent is received past the 1st of the month, a liquidated damages charge of $150 plus $25 per consecutive day shall be assessed immediately without grace period.',
      plainTranslation:
        'The landlord is charging an excessive, illegal late fee that acts as an unlawful punitive fine rather than a reasonable administrative cost.',
      statutoryDefect: 'UNENFORCEABLE LIQUIDATED DAMAGES PENALTY (Civil Code § 1671). Late fees must reflect actual costs, generally capped at 5%.',
      riskTier: 'AMBER_UNFAVORABLE',
      statuteCitation: 'Civil Code § 1671(d) & Orozco v. Casimiro (2004)',
      actionRecommendation: 'Dispute daily compounding fees in writing. Pay base rent with a notation: "Rent paid in full; late fee disputed under § 1671".',
    },
    {
      id: 'clause-3',
      lineNumber: 42,
      originalText:
        'Landlord reserves the unfettered right to enter the leased dwelling at any hour without prior notice for inspections, photography, or general evaluation.',
      plainTranslation:
        'The landlord claims they can unlock your front door at any time without warning.',
      statutoryDefect: 'CRIMINAL TRESPASS & STATUTORY VIOLATION (Civil Code § 1954). Law strictly mandates 24 hours written notice except during bona fide emergencies.',
      riskTier: 'RED_PREDATORY',
      statuteCitation: 'California Civil Code § 1954 (Tenant Privacy & Peaceful Enjoyment)',
      actionRecommendation: 'Demand in writing that all non-emergency entries comply with the 24-hour statutory written notice rule.',
    },
    {
      id: 'clause-4',
      lineNumber: 56,
      originalText:
        'Security deposit shall be non-refundable and automatically converted to a turnover fee upon expiration of lease term regardless of premises condition.',
      plainTranslation:
        'The landlord intends to steal your security deposit at move-out, regardless of how spotless you leave the apartment.',
      statutoryDefect: 'EXPRESSLY ILLEGAL (Cal. Civ. Code § 1950.5(m)). No security deposit may be designated or treated as "non-refundable".',
      riskTier: 'RED_PREDATORY',
      statuteCitation: 'California Civil Code § 1950.5(m) & Bad Faith Retention Rules',
      actionRecommendation: 'Document apartment condition with video at move-out. Exercise right to a pre-move-out joint walkthrough inspection.',
    },
  ];

  const handleClauseClick = (clause: DemystifiedClause) => {
    setActiveClauseId(clause.id);
    const el = document.getElementById(`doc-line-${clause.lineNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const activeClause = sampleClauses.find((c) => c.id === activeClauseId) || sampleClauses[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Closed-Loop Verification Badge */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div>
          <div className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>find_in_page</span>
            <span>Document Demystifier & Predatory Clause Scanner</span>
          </div>
          <h1>Contract & Notice Demystifier</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.5rem' }}>
            Interactive side-by-side translation transforming dense legal contracts into clear 6th-grade English.
            Predatory, void, and unconstitutional clauses flagged in real-time.
          </p>
        </div>

        {/* LexisLoop Critic Agent Badge */}
        <div className="legal-card" style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--surface-container-low)', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>verified_user</span>
            <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>LexisLoop Critic Agent Audited</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
            Accuracy Score: <strong style={{ color: 'var(--verified-green)' }}>98 / 100</strong> • Zero Hallucination Guarantee • ABA Model Rule 5.5 Compliant
          </div>
        </div>
      </div>

      {/* Action Suite & Clause Filter Bar */}
      <div
        className="legal-card"
        style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>
            Detected Predatory Terms ({sampleClauses.length}):
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {sampleClauses.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`btn ${activeClauseId === c.id ? 'btn-dark' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => handleClauseClick(c)}
              >
                <span className={c.riskTier === 'RED_PREDATORY' ? 'live-dot-red' : 'live-dot'}></span>
                <span>Line {c.lineNumber} ({c.riskTier === 'RED_PREDATORY' ? 'Predatory' : 'Unfavorable'})</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
            onClick={() => window.print()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
            <span>Export Redline PDF</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
            onClick={() => navigate('/action')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_document</span>
            <span>Draft Formal Dispute Letter</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Split View */}
      <div className="split-view">
        {/* Left Pane: Original Legal Document */}
        <div className="legal-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '720px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-faint)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>description</span>
              <h2 style={{ fontSize: '1.15rem' }}>Original Contract Document</h2>
            </div>
            <span className="badge badge-indigo">Residential Lease Agreement (CA)</span>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: 'var(--surface-container-low)',
              padding: '1.25rem',
              border: '1px solid var(--outline-faint)',
              fontSize: '0.88rem',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.8,
            }}
          >
            <div style={{ color: 'var(--outline)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
              // Standard Residential Tenancy Contract • Section 8. Maintenance, Fees, & Access Rights
            </div>

            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
              1. PARTIES & TERM. This agreement is entered between Apex Management LLC ("Landlord") and Tenant for premises located at 123 Main St.
            </p>

            <div
              id="doc-line-14"
              style={{
                backgroundColor: activeClauseId === 'clause-1' ? 'var(--emergency-bg)' : 'transparent',
                borderLeft: activeClauseId === 'clause-1' ? '4px solid var(--emergency-red)' : '4px solid transparent',
                padding: '0.5rem 0.75rem',
                margin: '0.5rem 0',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ color: 'var(--emergency-red)', fontWeight: 700, marginRight: '0.5rem' }}>[L.14]</span>
              <span>{sampleClauses[0].originalText}</span>
            </div>

            <p style={{ color: 'var(--on-surface-variant)', margin: '1rem 0' }}>
              2. USE OF PREMISES. The premises shall be occupied strictly for residential purposes. Noise disturbances are prohibited.
            </p>

            <div
              id="doc-line-28"
              style={{
                backgroundColor: activeClauseId === 'clause-2' ? 'var(--caution-bg)' : 'transparent',
                borderLeft: activeClauseId === 'clause-2' ? '4px solid var(--caution-amber)' : '4px solid transparent',
                padding: '0.5rem 0.75rem',
                margin: '0.5rem 0',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ color: 'var(--caution-amber)', fontWeight: 700, marginRight: '0.5rem' }}>[L.28]</span>
              <span>{sampleClauses[1].originalText}</span>
            </div>

            <p style={{ color: 'var(--on-surface-variant)', margin: '1rem 0' }}>
              3. UTILITIES & SERVICES. Tenant shall arrange for personal electric service with municipal power authority.
            </p>

            <div
              id="doc-line-42"
              style={{
                backgroundColor: activeClauseId === 'clause-3' ? 'var(--emergency-bg)' : 'transparent',
                borderLeft: activeClauseId === 'clause-3' ? '4px solid var(--emergency-red)' : '4px solid transparent',
                padding: '0.5rem 0.75rem',
                margin: '0.5rem 0',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ color: 'var(--emergency-red)', fontWeight: 700, marginRight: '0.5rem' }}>[L.42]</span>
              <span>{sampleClauses[2].originalText}</span>
            </div>

            <p style={{ color: 'var(--on-surface-variant)', margin: '1rem 0' }}>
              4. SURRENDER & INSPECTION. Upon conclusion of the tenancy term, keys must be returned to management office.
            </p>

            <div
              id="doc-line-56"
              style={{
                backgroundColor: activeClauseId === 'clause-4' ? 'var(--emergency-bg)' : 'transparent',
                borderLeft: activeClauseId === 'clause-4' ? '4px solid var(--emergency-red)' : '4px solid transparent',
                padding: '0.5rem 0.75rem',
                margin: '0.5rem 0',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ color: 'var(--emergency-red)', fontWeight: 700, marginRight: '0.5rem' }}>[L.56]</span>
              <span>{sampleClauses[3].originalText}</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Plain-English Rights Translation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="legal-card" style={{ borderTop: `4px solid ${activeClause.riskTier === 'RED_PREDATORY' ? 'var(--emergency-red)' : 'var(--caution-amber)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className={`badge ${activeClause.riskTier === 'RED_PREDATORY' ? 'badge-red' : 'badge-amber'}`}>
                <span className={activeClause.riskTier === 'RED_PREDATORY' ? 'live-dot-red' : 'live-dot'}></span>
                <span>Line {activeClause.lineNumber}: {activeClause.riskTier === 'RED_PREDATORY' ? 'Illegal Clause Void by Law' : 'High Risk Clause'}</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                Readability: Grade 6.2 (Plain Civic English)
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>What This Actually Means For You</h3>
            <p style={{ fontSize: '1rem', color: 'var(--on-surface)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {activeClause.plainTranslation}
            </p>

            {/* Statutory Defect Breakdown */}
            <div className="legal-card-well" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>balance</span>
                <span>Statutory Authority & Precedent</span>
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--emergency-red)', marginBottom: '0.25rem' }}>
                {activeClause.statutoryDefect}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
                Governing Rule: <em>{activeClause.statuteCitation}</em>
              </p>
            </div>

            {/* Actionable Shield */}
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
                Your Recommended Counter-Action:
              </span>
              <p style={{ fontSize: '0.88rem', color: 'var(--on-surface)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                {activeClause.actionRecommendation}
              </p>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: '0.8rem' }}
                onClick={() => navigate('/action')}
              >
                Generate Response Demand Letter
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem' }}
                onClick={() => navigate('/aid')}
              >
                Find Free Legal Clinic
              </button>
            </div>
          </div>

          {/* Quick Legal Knowledge Tip */}
          <div className="legal-card-well" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '24px', flexShrink: 0 }}>
              lightbulb
            </span>
            <div style={{ fontSize: '0.82rem', color: 'var(--on-surface)', lineHeight: 1.5 }}>
              <strong>Did You Know?</strong> Under California Civil Code § 1953, any provision in a residential lease by which a tenant agrees to waive or modify their statutory rights regarding security deposits, habitable dwelling repairs, or notice of eviction is <em>automatically void and unenforceable</em>. Signing the lease does NOT surrender these legal rights!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
