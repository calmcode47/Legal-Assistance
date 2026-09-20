import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triageIssue, LegalDomain, LegalDomainType, TriageResult, UrgencyLevel } from '../services/api';

export const EmergencyTriage: React.FC = () => {
  const navigate = useNavigate();

  const [narrative, setNarrative] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LegalDomainType>(LegalDomain.TENANCY_AND_HOUSING);
  const [stateCode, setStateCode] = useState('CA');
  const [zipCode, setZipCode] = useState('90012');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const categories = [
    { id: LegalDomain.TENANCY_AND_HOUSING, label: 'Tenancy & Evictions', icon: 'home' },
    { id: LegalDomain.EMPLOYMENT_AND_LABOR, label: 'Workplace & Wages', icon: 'badge' },
    { id: LegalDomain.CONSUMER_AND_DEBT, label: 'Debt Collection', icon: 'payments' },
    { id: LegalDomain.FAMILY_AND_DOMESTIC, label: 'Family & Custody', icon: 'family_restroom' },
    { id: LegalDomain.CIVIL_RIGHTS_AND_IMMIGRATION, label: 'Civil Rights', icon: 'shield' },
  ];

  // Voice speech-to-text handler
  const handleVoiceRecord = () => {
    type SpeechRecognitionLike = {
      lang: string;
      interimResults: boolean;
      onstart: (() => void) | null;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your situation in the text box.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNarrative((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  // Sample scenario loader
  const loadScenario = (text: string, category: LegalDomainType, state = 'CA', zip = '90012') => {
    setNarrative(text);
    setSelectedCategory(category);
    setStateCode(state);
    setZipCode(zip);
  };

  // Run live triage against backend /api/triage
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim() || narrative.trim().length < 5) {
      alert('Please describe your legal issue with at least 5 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await triageIssue({
        query: narrative,
        state: stateCode,
        zipCode: zipCode.trim() || undefined,
        domainHint: selectedCategory,
      });
      setTriageResult(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Header */}
      <div>
        <div className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>gavel</span>
          <span>Pro Se Defense Infrastructure • Rule of Law Access</span>
        </div>
        <h1>Free, Safe Legal Help in Plain Language</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.5rem' }}>
          Demystify eviction notices, unpaid wages, predatory debt, and complex legal contracts without expensive attorney retainers.
          Immediate triage backed by statutory code analysis and PII redaction.
        </p>
      </div>

      {/* Main Grid: Input Form & Guidance Cards */}
      <div className="split-view">
        {/* Left Column: Problem Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="legal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--outline-faint)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--secondary)' }}></span>
                <h2 style={{ fontSize: '1.25rem' }}>Describe what happened in your own words</h2>
              </div>
              <span className="badge badge-indigo">No Legal Jargon Needed</span>
            </div>

            {/* Category Pills */}
            <div style={{ marginBottom: '1.25rem' }} role="group" aria-labelledby="domain-label">
              <label id="domain-label" className="form-label" style={{ marginBottom: '0.5rem' }}>Select Legal Domain Area</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    aria-pressed={selectedCategory === cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* State and ZIP Code Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="triage-state">State / Jurisdiction</label>
                <select
                  id="triage-state"
                  className="form-select"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                >
                  <option value="CA">California (CA)</option>
                  <option value="NY">New York (NY)</option>
                  <option value="TX">Texas (TX)</option>
                  <option value="US">National / Other (US)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="triage-zip">5-Digit ZIP Code</label>
                <input
                  id="triage-zip"
                  type="text"
                  className="form-input"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="e.g. 90012"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
            </div>

            {/* Text Narrative Input */}
            <div className="form-group">
              <div className="form-label">
                <span>Incident Chronology & Facts</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--outline)' }}>
                  {narrative.length.toLocaleString()} / 2,500
                </span>
              </div>
              <textarea
                className="form-textarea"
                rows={6}
                maxLength={2500}
                placeholder="e.g. My landlord delivered a 3-day notice to pay or quit yesterday after I reported no hot water for 3 weeks. Now they are threatening to change my apartment locks tomorrow morning..."
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
              />
            </div>

            {/* Action Bar: Voice, Sample, Submit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className={`btn ${isRecording ? 'btn-danger' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                  onClick={handleVoiceRecord}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {isRecording ? 'mic' : 'mic_none'}
                  </span>
                  <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
                </button>

              </div>

              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handleAnalyze}
                style={{ padding: '0.55rem 1.5rem', fontSize: '0.85rem' }}
              >
                {loading ? (
                  <>
                    <span className="live-dot"></span>
                    <span>Triage in Progress...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bolt</span>
                    <span>Analyze My Rights Safely</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Scenarios */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px dashed var(--outline-variant)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
                Test Sample Legal Scenarios:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                  onClick={() =>
                    loadScenario(
                      'Received a 3-day notice to quit for withholding rent due to severe water leak and black mold in bathroom that landlord refused to fix for 45 days.',
                      LegalDomain.TENANCY_AND_HOUSING,
                      'CA',
                      '90012'
                    )
                  }
                >
                  ⚡ Eviction: 3-Day Notice & Mold
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                  onClick={() =>
                    loadScenario(
                      'Employer withheld final paycheck and last 3 weeks of overtime wages after I resigned, claiming unspecified inventory damage.',
                      LegalDomain.EMPLOYMENT_AND_LABOR,
                      'CA',
                      '90012'
                    )
                  }
                >
                  💼 Wage Theft: Withheld Overtime
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                  onClick={() =>
                    loadScenario(
                      'Third-party debt collection agency calls my workplace 6 times daily and threatens arrest for an 8-year-old disputed medical charge.',
                      LegalDomain.CONSUMER_AND_DEBT,
                      'NY',
                      '10001'
                    )
                  }
                >
                  🛡️ FDCPA: Harassing Debt Calls
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Urgency Meter & Security Assurance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Urgency Threat Meter */}
          <div
            className="legal-card"
            style={{
              backgroundColor:
                triageResult?.urgencyLevel === UrgencyLevel.CRITICAL
                  ? 'var(--emergency-bg)'
                  : 'var(--surface-container-lowest)',
              borderColor:
                triageResult?.urgencyLevel === UrgencyLevel.CRITICAL
                  ? 'var(--emergency-border)'
                  : 'var(--outline-faint)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: triageResult?.urgencyLevel === UrgencyLevel.CRITICAL ? 'var(--emergency-text)' : 'var(--primary)' }}>
                Urgency & Threat Assessment
              </h3>
              <span
                className={`badge ${
                  triageResult?.urgencyLevel === UrgencyLevel.CRITICAL
                    ? 'badge-red'
                    : triageResult
                    ? 'badge-amber'
                    : 'badge-green'
                }`}
              >
                <span className={triageResult?.urgencyLevel === UrgencyLevel.CRITICAL ? 'live-dot-red' : 'live-dot'}></span>
                <span>{triageResult ? `${triageResult.urgencyLevel} SEVERITY` : 'SYSTEM READY'}</span>
              </span>
            </div>

            {triageResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                  <span>Detected Domain: <strong>{triageResult.detectedDomain}</strong></span>
                  <span className="badge badge-green">{Math.round(triageResult.confidenceScore * 100)}% AI Grounding</span>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--on-surface)', lineHeight: 1.6 }}>
                  {triageResult.urgencyReasoning}
                </p>

                {/* Emergency Hotlines Callout */}
                {triageResult.emergencyHotlinesTriggered && (
                  <div className="legal-card-well" style={{ backgroundColor: '#ffffff', borderLeft: '4px solid var(--emergency-red)', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emergency-red)', fontWeight: 700, fontSize: '0.8rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>crisis_alert</span>
                      <span>CRITICAL DEFENSE HOTLINE TRIGGERED</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', marginTop: '0.3rem', color: 'var(--on-surface)' }}>
                      A lockout or utility shutoff may require immediate help. Preserve the notice and contact local legal aid through <strong>2-1-1</strong> or <strong>LawHelp.org</strong>.
                    </p>
                  </div>
                )}

                {triageResult.statutoryDeadlineAlert && (
                  <div className="legal-card-well" style={{ borderLeft: '3px solid var(--emergency-red)', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emergency-red)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>gavel</span>
                      <span>Statutory Deadline Protection</span>
                    </div>
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--on-surface)' }}>
                      "{triageResult.statutoryDeadlineAlert}"
                    </p>
                  </div>
                )}

                {/* Next Steps List */}
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>
                    Recommended Immediate Actions:
                  </span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    {(triageResult.nextSteps || []).map((step, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>
                          arrow_forward
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dynamic Smart Routing Based on recommendedNextModule */}
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    Recommended Next Module:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={`btn ${triageResult.recommendedNextModule === 'DEMYSTIFIER' ? 'btn-primary' : 'btn-dark'}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => navigate('/analyze')}
                    >
                      Demystify Document
                    </button>
                    <button
                      type="button"
                      className={`btn ${triageResult.recommendedNextModule === 'RIGHTS_NAVIGATOR' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => navigate('/rights')}
                    >
                      Review Your Rights
                    </button>
                    <button
                      type="button"
                      className={`btn ${triageResult.recommendedNextModule === 'AID_LOCATOR' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => navigate('/aid')}
                    >
                      Locate Free Legal Aid
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => navigate('/action')}
                    >
                      Build Demand Letter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                <p>
                  Input your situation on the left or click a sample scenario to run an immediate statutory urgency assessment.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
                  <div className="legal-card-well" style={{ padding: '0.75rem' }}>
                    <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--primary)' }}>CRITICAL</strong>
                    <span style={{ fontSize: '0.75rem' }}>&le; 72hr court notice, lockout, sheriff notice</span>
                  </div>
                  <div className="legal-card-well" style={{ padding: '0.75rem' }}>
                    <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--primary)' }}>HIGH</strong>
                    <span style={{ fontSize: '0.75rem' }}>14-day statutory deadline, debt summons</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zero-Trace Security & Ethics Card */}
          <div className="legal-card" style={{ borderLeft: '4px solid var(--verified-green)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--verified-green)' }}>lock</span>
              <h3 style={{ fontSize: '1rem' }}>Client Privacy & Zero Data Retention</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
              Common identifiers such as phone numbers, email addresses, and Social Security numbers are redacted before model processing. Avoid entering information that is not needed for your question.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
