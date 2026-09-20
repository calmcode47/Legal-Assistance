import React, { useState } from 'react';
import { matchLegalAid, LegalAidData, LegalDomain, LegalDomainType } from '../services/api';

export const LegalAidLocator: React.FC = () => {
  const [zipCode, setZipCode] = useState('90012');
  const [stateCode, setStateCode] = useState('CA');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [income, setIncome] = useState(24000);
  const [householdSize, setHouseholdSize] = useState(3);
  const [loading, setLoading] = useState(false);
  const [legalAidData, setLegalAidData] = useState<LegalAidData | null>(null);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const data = await matchLegalAid({
        zipCode,
        state: stateCode,
        domain: domainFilter === 'ALL' ? undefined : (domainFilter as LegalDomainType),
        annualHouseholdIncome: income,
        householdSize,
      });
      setLegalAidData(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClinics();
  };

  const checklist = legalAidData?.intakeChecklist;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>pin_drop</span>
          <span>Pro Bono Directory • LSC Verified Organizations</span>
        </div>
        <h1>Free Legal Aid & Clinic Locator</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.5rem' }}>
          Connect directly with verified Legal Services Corporation (LSC) organizations, voluntary bar association clinics, and civil defense networks in your jurisdiction.
        </p>
      </div>

      {/* Pre-Screener & Filter Bar */}
      <form onSubmit={handleSearch} className="legal-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">State Jurisdiction</label>
            <select
              className="form-select"
              value={stateCode}
              onChange={(e) => {
                const s = e.target.value;
                setStateCode(s);
                if (s === 'NY') setZipCode('10001');
                else if (s === 'TX') setZipCode('77002');
                else if (s === 'CA') setZipCode('90012');
              }}
            >
              <option value="CA">California (CA)</option>
              <option value="NY">New York (NY)</option>
              <option value="TX">Texas (TX)</option>
              <option value="US">National / Other (US)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">ZIP Code</label>
            <input
              type="text"
              className="form-input"
              value={zipCode}
              maxLength={5}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="e.g. 90012"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Practice Area</label>
            <select
              className="form-select"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              <option value="ALL">All Legal Practice Areas</option>
              <option value={LegalDomain.TENANCY_AND_HOUSING}>Tenancy & Evictions</option>
              <option value={LegalDomain.EMPLOYMENT_AND_LABOR}>Workplace & Wages</option>
              <option value={LegalDomain.CONSUMER_AND_DEBT}>Consumer & Debt</option>
              <option value={LegalDomain.FAMILY_AND_DOMESTIC}>Family & Domestic</option>
              <option value={LegalDomain.CIVIL_RIGHTS_AND_IMMIGRATION}>Civil Rights & Immigration</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Annual Income ($)</label>
            <input
              type="number"
              className="form-input"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              placeholder="e.g. 24000"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Household Size</label>
            <select
              className="form-select"
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px' }}>
            {loading ? 'Finding Clinics...' : 'Search Legal Clinics'}
          </button>
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
            This directory provides general referrals. Confirm current eligibility, intake hours, and representation availability directly with each organization.
          </p>
        </div>
      </form>

      {/* FPL Eligibility Banner */}
      {legalAidData && (
        <div
          className="legal-card"
          style={{
            backgroundColor: legalAidData.isEligibleForFreeLegalAid ? 'var(--verified-bg)' : 'var(--caution-bg)',
            borderColor: legalAidData.isEligibleForFreeLegalAid ? 'var(--verified-border)' : 'var(--caution-border)',
            borderLeft: `5px solid ${legalAidData.isEligibleForFreeLegalAid ? 'var(--verified-green)' : 'var(--caution-amber)'}`,
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: legalAidData.isEligibleForFreeLegalAid ? 'var(--verified-green)' : 'var(--caution-amber)' }}>
                {legalAidData.isEligibleForFreeLegalAid ? 'verified' : 'info'}
              </span>
              <div>
                <strong style={{ fontSize: '1rem', color: legalAidData.isEligibleForFreeLegalAid ? 'var(--verified-text)' : 'var(--caution-text)' }}>
                  {legalAidData.isEligibleForFreeLegalAid
                    ? 'You may meet this directory’s income-screening estimate'
                    : 'Income may be above this directory’s screening estimate'}
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface)', marginTop: '0.2rem' }}>
                  Your estimated household income is approximately <strong>{legalAidData.estimatedFplPercentage}%</strong> of the Federal Poverty Guideline. 
                  This is an estimate only. Each organization makes its own eligibility and representation decision.
                </p>
              </div>
            </div>

            <div className="badge badge-green">
              <span>Eligibility estimate</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Clinic Directory Cards & Sticky Intake Checklist */}
      <div className="split-view">
        {/* Left Column: Clinic Directory Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Verified Pro Bono & Legal Aid Clinics ({legalAidData?.clinics.length || 0})</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Serving {stateCode} • ZIP {zipCode}</span>
          </div>

          {legalAidData?.clinics.map((clinic) => (
            <div key={clinic.id} className="legal-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>{clinic.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>
                    {clinic.address} • {clinic.jurisdiction}
                  </div>
                </div>
                {clinic.isLscFunded && (
                  <span className="badge badge-green">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
                    <span>LSC Funded</span>
                  </span>
                )}
              </div>

              {/* Practice Areas */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {clinic.practiceAreas.map((area, idx) => (
                  <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                    {typeof area === 'string' ? area.replace(/_/g, ' ') : area}
                  </span>
                ))}
              </div>

              {/* Hours & Contact */}
              <div className="legal-card-well" style={{ padding: '0.75rem 1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div>
                  <strong style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontSize: '0.72rem', display: 'block' }}>Walk-In Intake Hours</strong>
                  <span>{clinic.walkInHours}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontSize: '0.72rem', display: 'block' }}>Income Threshold</strong>
                  <span>Up to {clinic.incomeLimitFplPercentage}% FPL</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontSize: '0.72rem', display: 'block' }}>Intake Hotline</strong>
                  <a href={`tel:${clinic.phone.replace(/[^0-9]/g, '')}`} style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>
                    {clinic.phone}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a
                  href={`tel:${clinic.phone.replace(/[^0-9]/g, '')}`}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>call</span>
                  <span>Call Hotline</span>
                </a>
                <a
                  href={clinic.website}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                  <span>Online Intake Portal</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Structured Intake Preparation Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="legal-card" style={{ borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>checklist</span>
              <h3 style={{ fontSize: '1.1rem' }}>Intake Preparation Checklist</h3>
            </div>

            {checklist && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="legal-card-well" style={{ fontSize: '0.82rem', padding: '0.65rem 0.85rem' }}>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>Eligibility Overview</strong>
                  <span>{checklist.eligibilityOverview}</span>
                </div>

                <div>
                  <strong style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.4rem' }}>
                    Documents to Bring to Appointment:
                  </strong>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.83rem' }}>
                    {(checklist.recommendedDocuments || []).map((doc, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--verified-green)', fontSize: '16px', flexShrink: 0 }}>
                          task_alt
                        </span>
                        <span style={{ color: 'var(--on-surface)', lineHeight: 1.4 }}>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {checklist.intakeQuestionsToExpect && checklist.intakeQuestionsToExpect.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.4rem' }}>
                      Questions You Will Be Asked:
                    </strong>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                      {checklist.intakeQuestionsToExpect.map((q, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '16px', flexShrink: 0 }}>
                            help_outline
                          </span>
                          <span style={{ color: 'var(--on-surface-variant)' }}>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {checklist.urgencyNote && (
                  <div className="legal-card-well" style={{ borderLeft: '3px solid var(--caution-amber)', backgroundColor: 'var(--caution-bg)', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
                    <strong>Notice:</strong> {checklist.urgencyNote}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '0.78rem' }}
                onClick={() => window.print()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
                <span>Print Intake Checklist</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
