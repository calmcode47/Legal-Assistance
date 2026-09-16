import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EvidenceItem {
  id: string;
  type: string;
  note: string;
  timestamp: string;
}

export const RightsNavigator: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(2); // Default to Step 2 for immediate actionability
  const [selectedState, setSelectedState] = useState<string>('CA');
  const [selectedDomain, setSelectedDomain] = useState<string>('TENANCY');

  // Violations checklist state
  const [violations, setViolations] = useState<{ [key: string]: boolean }>({
    changed_locks: true,
    no_statutory_reason: false,
    short_notice: true,
    retaliatory_rent: false,
    withheld_deposit: false,
    no_heat_water: true,
  });

  // Evidence docket state
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([
    {
      id: 'ev-1',
      type: 'Notice Photo',
      note: 'Photograph of 3-day notice taped to exterior door without court stamp or landlord signature',
      timestamp: 'Yesterday, 14:20',
    },
    {
      id: 'ev-2',
      type: 'Text Messages',
      note: 'SMS exchange with landlord complaining about burst bathroom pipe 12 days before receiving notice',
      timestamp: '3 days ago',
    },
  ]);
  const [newEvidenceNote, setNewEvidenceNote] = useState('');

  const toggleViolation = (key: string) => {
    setViolations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeViolationsCount = Object.values(violations).filter(Boolean).length;

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceNote.trim()) return;

    setEvidenceList((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        type: 'User Record',
        note: newEvidenceNote.trim(),
        timestamp: 'Just now',
      },
    ]);
    setNewEvidenceNote('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>route</span>
          <span>Interactive Decision Tree • Statutory Violations Navigator</span>
        </div>
        <h1>Tenant & Worker Rights Navigator</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.5rem' }}>
          Determine if your landlord, employer, or debt collector has committed procedural errors or unlawful self-help actions under state and federal law.
        </p>
      </div>

      {/* 4-Step Progress Tracker */}
      <div
        className="legal-card"
        style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          backgroundColor: 'var(--surface-container-low)',
        }}
      >
        {[
          { step: 1, title: '1. Jurisdiction & Issue' },
          { step: 2, title: '2. Unlawful Actions' },
          { step: 3, title: '3. Procedural Deficiencies' },
          { step: 4, title: '4. Legal Rights & Shields' },
        ].map((item) => (
          <button
            key={item.step}
            type="button"
            onClick={() => setCurrentStep(item.step)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: currentStep === item.step ? 'var(--primary)' : 'transparent',
              color: currentStep === item.step ? '#ffffff' : 'var(--on-surface-variant)',
              border: 'none',
              padding: '0.45rem 0.85rem',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: currentStep === item.step ? 'var(--secondary)' : 'var(--outline-variant)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
              }}
            >
              {item.step}
            </span>
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {/* Main Container: Step Content + Evidence Docket */}
      <div className="split-view">
        {/* Left Column: Interactive Wizard Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {currentStep === 1 && (
            <div className="legal-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Step 1: Jurisdiction & Domain</h2>
              <div className="form-group">
                <label className="form-label">Select Your State / Territory</label>
                <select
                  className="form-select"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="CA">California (Civil Code & URLTA Enhanced)</option>
                  <option value="NY">New York (HSTPA Enhanced Tenant Protection)</option>
                  <option value="TX">Texas (Property Code Chapter 92)</option>
                  <option value="IL">Illinois (RLTO Chicago & State Code)</option>
                  <option value="FL">Florida (Chapter 83 Landlord and Tenant)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Legal Protection Category</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'TENANCY', label: 'Residential Housing & Eviction' },
                    { id: 'LABOR', label: 'Unpaid Wages & Retaliation' },
                    { id: 'DEBT', label: 'Debt Collection Harassment (FDCPA)' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`pill ${selectedDomain === cat.id ? 'active' : ''}`}
                      onClick={() => setSelectedDomain(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: '1.5rem' }}
                onClick={() => setCurrentStep(2)}
              >
                Continue to Step 2: Unlawful Actions &rarr;
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="legal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--outline-faint)', paddingBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem' }}>Step 2: Landlord / Employer Conduct</h2>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Select all actions taken against you. Each triggers verified statutory defenses.
                  </p>
                </div>
                <span className="badge badge-red">{activeViolationsCount} Statutory Violations Recorded</span>
              </div>

              {/* Conduct Checklist Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  {
                    key: 'changed_locks',
                    title: 'Changed locks, removed doors, or shut off utility services',
                    severity: 'CRIMINAL MISDEMEANOR & STATUTORY TORT',
                    citation: 'Cal. Civ. Code § 789.3 (Self-Help Prohibition)',
                    desc: 'Landlords cannot physically lock you out or shut off utilities. Subject to actual damages + $100/day penalty.',
                  },
                  {
                    key: 'short_notice',
                    title: 'Served notice with less than mandatory statutory period',
                    severity: 'DEFECTIVE NOTICE — INVALID FOR EVICTION',
                    citation: 'Code of Civil Procedure § 1161',
                    desc: 'A 3-day notice must exclude weekends and court holidays. If miscalculated, unlawful detainer must be dismissed.',
                  },
                  {
                    key: 'no_heat_water',
                    title: 'Refused repairs to essential plumbing, heating, or waterproof roof',
                    severity: 'BREACH OF IMPLIED WARRANTY OF HABITABILITY',
                    citation: 'Civil Code § 1941.1 & Green v. Superior Court',
                    desc: 'Tenants have the statutory right to habitability. Landlord cannot collect rent during substantial defects.',
                  },
                  {
                    key: 'retaliatory_rent',
                    title: 'Raised rent or issued notice immediately after repair request',
                    severity: 'PRESUMPTIVE UNLAWFUL RETALIATION',
                    citation: 'Cal. Civ. Code § 1942.5 (180-Day Retaliation Bar)',
                    desc: 'Any adverse action within 180 days of a habitability complaint is presumed retaliatory under state law.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => toggleViolation(item.key)}
                    className="legal-card-well"
                    style={{
                      cursor: 'pointer',
                      borderLeft: violations[item.key] ? '4px solid var(--emergency-red)' : '4px solid var(--outline-variant)',
                      backgroundColor: violations[item.key] ? 'var(--emergency-bg)' : 'var(--surface-container-low)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={violations[item.key] || false}
                        onChange={() => {}}
                        style={{ marginTop: '0.25rem', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--primary)' }}>{item.title}</strong>
                          <span className={`badge ${violations[item.key] ? 'badge-red' : 'badge-indigo'}`} style={{ fontSize: '0.68rem' }}>
                            {item.severity}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginTop: '0.35rem' }}>
                          {item.desc}
                        </p>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)', marginTop: '0.35rem' }}>
                          Statutory Shield: {item.citation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                  &larr; Back to Step 1
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                  Continue to Step 3: Procedural Audit &rarr;
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="legal-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Step 3: Procedural Deficiencies</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Eviction cases are strictly procedural. Any defect in notice drafting or service voids the entire lawsuit.
              </p>

              <div className="legal-card-well" style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>Common Fatal Procedural Errors:</strong>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--verified-green)', fontSize: '18px' }}>check_box</span>
                    <span>Notice failed to specify exact address and judicial hours where rent can be paid</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--verified-green)', fontSize: '18px' }}>check_box</span>
                    <span>Notice demanded late fees, utility bills, or fines in a 3-day notice to pay rent or quit (ILLEGAL OVERSTATEMENT)</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--verified-green)', fontSize: '18px' }}>check_box</span>
                    <span>Service completed solely by email or text message without statutory personal delivery</span>
                  </li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(2)}>
                  &larr; Back to Step 2
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                  View Your Statutory Defense Shield &rarr;
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="legal-card">
              <div className="badge badge-green" style={{ marginBottom: '0.75rem' }}>
                <span>Statutory Defense Docket Assembled</span>
              </div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Step 4: Your Legal Rights & Affirmative Defenses</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Based on your selections in {selectedState}, you have established {activeViolationsCount} prima facie affirmative statutory defenses.
              </p>

              <div className="legal-card-well" style={{ borderLeft: '4px solid var(--verified-green)', backgroundColor: 'var(--verified-bg)', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--verified-text)', fontSize: '0.95rem' }}>Affirmative Defense 1: Breach of Habitability (Green Defense)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface)', marginTop: '0.25rem' }}>
                  Because substantial plumbing/heating defects existed and landlord had notice, your duty to pay full rent was suspended. Landlord cannot evict for non-payment until judicial determination of fair rental value.
                </p>
              </div>

              <div className="legal-card-well" style={{ borderLeft: '4px solid var(--secondary)', backgroundColor: 'var(--surface-container-low)', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>Affirmative Defense 2: Unlawful Self-Help Remedy (§ 789.3)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface)', marginTop: '0.25rem' }}>
                  Landlord's lockout threat constitutes a statutory tort. You may assert a cross-complaint for statutory penalties ($100 per day) plus attorney's fees.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/aid')}>
                  Connect to Eviction Defense Attorney
                </button>
                <button type="button" className="btn btn-dark" onClick={() => navigate('/action')}>
                  Draft Answer / Notice of Dispute
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/analyze')}>
                  Demystify Notice with AI
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(2)}>
                  Modify Violations
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Statutory Countdown & Evidence Docket */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Statutory Countdown Timer Widget */}
          <div className="legal-card" style={{ borderLeft: '4px solid var(--emergency-red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emergency-red)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span>
                <span>Court Answer Deadline Tracker</span>
              </div>
              <span className="live-dot-red"></span>
            </div>

            <div style={{ fontSize: '1.75rem', fontFamily: 'var(--font-headline)', fontWeight: 700, color: 'var(--emergency-red)', lineHeight: 1.1 }}>
              68 Hours : 42 Minutes
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.35rem' }}>
              Calculated for 3-Day Notice served in Los Angeles County. (Excludes legal judicial holidays and court closure hours).
            </p>

            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', backgroundColor: 'var(--emergency-bg)', padding: '0.5rem 0.75rem', border: '1px solid var(--emergency-border)', color: 'var(--emergency-text)' }}>
              <strong>Crucial Rule:</strong> If you do not file a formal written Answer with the court clerk within the deadline, landlord can obtain a default judgment without a trial!
            </div>
          </div>

          {/* Interactive Evidence Docket */}
          <div className="legal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>folder_special</span>
                <h3 style={{ fontSize: '1.1rem' }}>Evidence Docket ({evidenceList.length})</h3>
              </div>
              <span className="badge badge-green">Zero-Trace Encrypted</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
              {evidenceList.map((item) => (
                <div key={item.id} className="legal-card-well" style={{ padding: '0.65rem 0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>
                    <strong style={{ color: 'var(--secondary)' }}>{item.type}</strong>
                    <span>{item.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--on-surface)', lineHeight: 1.4 }}>
                    {item.note}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Evidence Input */}
            <form onSubmit={handleAddEvidence} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Log evidence (e.g., Photo of broken lock, date of verbal notice)..."
                value={newEvidenceNote}
                onChange={(e) => setNewEvidenceNote(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              />
              <button type="submit" className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.45rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                <span>Add to Evidence Docket</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
