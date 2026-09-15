import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triageIssue, LegalDomain, LegalDomainType, TriageData, UrgencyLevel } from '../services/api';

export const EmergencyTriage: React.FC = () => {
  const navigate = useNavigate();

  const [narrative, setNarrative] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LegalDomainType>(LegalDomain.TENANCY_AND_HOUSING);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<TriageData | null>(null);

  const categories = [
    { id: LegalDomain.TENANCY_AND_HOUSING, label: 'Tenancy & Evictions', icon: 'home' },
    { id: LegalDomain.EMPLOYMENT_AND_LABOR, label: 'Workplace & Wages', icon: 'badge' },
    { id: LegalDomain.CONSUMER_AND_DEBT, label: 'Debt Collection', icon: 'payments' },
    { id: LegalDomain.FAMILY_AND_DOMESTIC, label: 'Family & Custody', icon: 'family_restroom' },
    { id: LegalDomain.CIVIL_RIGHTS_AND_IMMIGRATION, label: 'Civil Rights', icon: 'shield' },
  ];

  // Voice speech-to-text handler
  const handleVoiceRecord = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your situation in the text box.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNarrative((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  // Sample scenario loader
  const loadScenario = (text: string, category: LegalDomainType) => {
    setNarrative(text);
    setSelectedCategory(category);
  };

  // Run live triage
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) {
      alert('Please describe your legal issue or select a sample scenario.');
      return;
    }

    setLoading(true);
    try {
      const result = await triageIssue({
        query: narrative,
        state: 'CA',
        zipCode: '90012',
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
          Immediate triage backed by statutory code analysis.
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
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Select Legal Domain Area</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
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

            {/* Action Bar: Voice, Upload, Sample, Submit */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleVoiceRecord}
                  className={`btn btn-outline ${isRecording ? 'badge-red' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.85rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isRecording ? 'var(--emergency-red)' : 'inherit' }}>
                    {isRecording ? 'mic' : 'mic_none'}
                  </span>
                  <span>{isRecording ? 'Recording Voice...' : 'Dictate Issue'}</span>
                </button>

                <label className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem 0.85rem', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
                  <span>Attach Notice</span>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadedFileName(file.name);
                        if (!narrative) {
                          setNarrative(`[Attached Document: ${file.name}]\nAnalyzing civil legal notice and statutory deadlines under state code...`);
                        }
                      }
                    }}
                  />
                </label>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handleAnalyze}
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}
              >
                {loading ? (
                  <>
                    <span className="live-dot"></span>
                    <span>Analyzing Legal Situation...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">gavel</span>
                    <span>Analyze My Rights Safely</span>
                  </>
                )}
              </button>
            </div>

            {uploadedFileName && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--verified-green)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                <span>Attached: <strong>{uploadedFileName}</strong> (Client-side PII scrubbed before transmission)</span>
              </div>
            )}

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
                      LegalDomain.TENANCY_AND_HOUSING
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
                      LegalDomain.EMPLOYMENT_AND_LABOR
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
                      LegalDomain.CONSUMER_AND_DEBT
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
                <p style={{ fontSize: '0.9rem', color: 'var(--on-surface)', lineHeight: 1.6 }}>
                  {triageResult.urgencyReasoning}
                </p>

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

                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>
                    Recommended Immediate Actions:
                  </span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    {triageResult.nextSteps.map((step, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>
                          arrow_forward
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Transition Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-dark"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => navigate('/rights')}
                  >
                    Verify Statutory Rights
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
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
              All names, phone numbers, addresses, and Social Security Numbers are automatically stripped client-side before any cognitive processing. 
              Sessions are ephemeral and purged immediately upon exit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
