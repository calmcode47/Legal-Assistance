import React, { useState, useEffect } from 'react';
import { generateProSeLetter, ProSeLetterData } from '../services/api';

export const DemandLetterBuilder: React.FC = () => {
  const [templateType, setTemplateType] = useState<
    'SECURITY_DEPOSIT_RETURN' | 'HABITABILITY_REPAIR_DEMAND' | 'UNPAID_WAGES_DEMAND' | 'FDCPA_DEBT_VALIDATION'
  >('SECURITY_DEPOSIT_RETURN');

  const [senderName, setSenderName] = useState('Elena Gomez');
  const [senderAddress, setSenderAddress] = useState('456 Oak St, Apt 2B, Los Angeles, CA 90012');
  const [recipientName, setRecipientName] = useState('Apex Properties LLC');
  const [recipientAddress, setRecipientAddress] = useState('789 Commercial Blvd, Los Angeles, CA 90017');
  const [rentalAddress, setRentalAddress] = useState('123 Main St, Apt 4, Los Angeles, CA 90012');
  const [disputedAmount, setDisputedAmount] = useState<number>(1850.0);
  const [incidentDate, setIncidentDate] = useState('August 31, 2026');
  const [includeTrebleDamages, setIncludeTrebleDamages] = useState(true);
  const [additionalContext, setAdditionalContext] = useState('');

  const [loading, setLoading] = useState(false);
  const [letterData, setLetterData] = useState<ProSeLetterData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMailInstructions, setShowMailInstructions] = useState(false);

  const loadLetter = async () => {
    setLoading(true);
    try {
      const data = await generateProSeLetter({
        templateType,
        senderName,
        senderAddress,
        recipientName,
        recipientAddress,
        rentalOrWorkplaceAddress: rentalAddress,
        disputedAmount,
        incidentDate,
        includeTrebleDamages,
        additionalContext: additionalContext.trim() || undefined,
      });
      setLetterData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLetter();
  }, [templateType, includeTrebleDamages]);

  const handleCopyText = () => {
    if (!letterData) return;
    navigator.clipboard.writeText(letterData.letterText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="no-print">
        <div className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>mark_email_read</span>
          <span>Pro Se Court Document Suite • Formal Notice Generator</span>
        </div>
        <h1>Pro Se Legal Demand Notice Builder</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.5rem' }}>
          Format formal, legally sound, and properly served demand letters that self-represented citizens can sign, send via certified mail, or enter into court records.
        </p>
      </div>

      {/* Action Toolbar */}
      <div
        className="legal-card no-print"
        style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--verified-green)' }}>verified</span>
          <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
            Governing Authority: {letterData?.formalCitation || 'Statutory Civil Code Authority'}
          </strong>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
            onClick={() => setShowMailInstructions(!showMailInstructions)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_shipping</span>
            <span>USPS Certified Mail Slip Guide</span>
          </button>

          <button
            type="button"
            className={`btn ${copied ? 'btn-dark' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
            onClick={handleCopyText}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Plain Text'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
            onClick={() => window.print()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
            <span>Print / Save Formal PDF</span>
          </button>
        </div>
      </div>

      {showMailInstructions && letterData && (
        <div className="legal-card-well no-print" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>
              USPS Certified Mail Instructions (Required to Prove Service in Court)
            </strong>
            <button
              type="button"
              onClick={() => setShowMailInstructions(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--on-surface)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(letterData.certifiedMailInstructions || []).map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Main Split Screen */}
      <div className="split-view">
        {/* Left Column: Letter Customization Form */}
        <div className="legal-card no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Notice Configuration</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
              Choose a statutory demand template and customize party and claim information.
            </p>
          </div>

          {/* Template Buttons */}
          <div className="form-group">
            <label className="form-label">Notice Template Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { id: 'SECURITY_DEPOSIT_RETURN', label: '1. Security Deposit Refund Demand (§ 1950.5)' },
                { id: 'HABITABILITY_REPAIR_DEMAND', label: '2. Notice of Habitability Defect & Repairs (§ 1941.1)' },
                { id: 'UNPAID_WAGES_DEMAND', label: '3. Unpaid Overtime & Wage Recovery Notice' },
                { id: 'FDCPA_DEBT_VALIDATION', label: '4. FDCPA Debt Validation & Dispute Notice' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`btn ${templateType === t.id ? 'btn-dark' : 'btn-outline'}`}
                  style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  onClick={() => setTemplateType(t.id as any)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Your Name (Sender)</label>
              <input
                type="text"
                className="form-input"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Opposing Party (Recipient)</label>
              <input
                type="text"
                className="form-input"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Mailing Address</label>
            <input
              type="text"
              className="form-input"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Opposing Party Address</label>
            <input
              type="text"
              className="form-input"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rental or Workplace Premises Address</label>
            <input
              type="text"
              className="form-input"
              value={rentalAddress}
              onChange={(e) => setRentalAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Disputed Amount ($)</label>
              <input
                type="number"
                className="form-input"
                value={disputedAmount}
                onChange={(e) => setDisputedAmount(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Incident / Vacate Date</label>
              <input
                type="text"
                className="form-input"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Dispute Facts or Account Numbers</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g. Broken water heater since July 12th; or Account #982-124; or Unpaid overtime for August..."
            />
          </div>

          {templateType === 'SECURITY_DEPOSIT_RETURN' && (
            <div
              className="legal-card-well"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              onClick={() => setIncludeTrebleDamages(!includeTrebleDamages)}
            >
              <input
                type="checkbox"
                checked={includeTrebleDamages}
                onChange={() => {}}
                style={{ width: '18px', height: '18px' }}
              />
              <div style={{ fontSize: '0.82rem', color: 'var(--on-surface)' }}>
                <strong>Include statutory bad-faith punitive penalty demand</strong>
                <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>
                  Cites bad faith retention penalties permitting recovery of up to twice or treble the deposit amount.
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={loadLetter}
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Refreshing Document...' : 'Regenerate Document Preview'}
          </button>
        </div>

        {/* Right Column: Formal Legal Document Paper Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="paper-canvas" id="letter-canvas">
            {letterData ? (
              <pre
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  color: '#111827',
                }}
              >
                {letterData.letterText}
              </pre>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--outline)' }}>
                Generating formatted legal demand notice...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
