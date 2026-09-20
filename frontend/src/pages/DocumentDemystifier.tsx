import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  analyzeContract,
  executeCognitiveLoop,
  ExplainerDraft,
  LoopExecutionReceipt,
  LegalDomain,
  LegalDomainType,
  PredatoryClause,
  ClauseRiskTier,
} from '../services/api';

interface SampleDoc {
  title: string;
  domain: LegalDomainType;
  jurisdiction: string;
  text: string;
}

const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    title: 'Residential Lease with Habitability Waivers',
    domain: LegalDomain.TENANCY_AND_HOUSING,
    jurisdiction: 'California',
    text: `RESIDENTIAL LEASE AND OCCUPANCY AGREEMENT

1. PREMISES & TERM: Landlord hereby leases to Tenant the premises located at 456 Oak Street, Unit 2B, Los Angeles, CA 90012, for a term commencing September 1, 2026.

2. RENT & PENALTIES: Rent is $1,850.00 per month, due strictly on the 1st day of each month. If rent is received past the 1st of the month, a liquidated damages charge of $150 plus $25 per consecutive day shall be assessed immediately without grace period.

3. WAIVER OF HABITABILITY: Tenant hereby unconditionally waives all statutory rights under Civil Code Section 1942, and agrees that Landlord shall have no obligation to maintain the heating, electrical, or plumbing fixtures. Tenant agrees to bear all costs of internal pipe and fixture repairs.

4. INSPECTION & RIGHT OF ENTRY: Landlord reserves the unfettered right to enter the leased dwelling at any hour without prior notice for inspections, photography, or general evaluation.

5. SECURITY DEPOSIT: Security deposit of $1,850.00 shall be non-refundable and automatically converted to a turnover fee upon expiration of lease term regardless of premises condition.

6. DISPUTE FORFEITURE: Tenant unconditionally waives the right to a trial by jury and agrees that all legal disputes must be filed within 30 days of occurrence or be permanently barred.`,
  },
  {
    title: '3-Day Notice to Pay Rent or Quit',
    domain: LegalDomain.TENANCY_AND_HOUSING,
    jurisdiction: 'California',
    text: `THREE-DAY NOTICE TO PAY RENT OR SURRENDER POSSESSION

TO: Elena Gomez and all other tenants or subtenants in possession.
PREMISES: 123 Main Street, Apt 4, Los Angeles, CA 90012.

PLEASE TAKE NOTICE that pursuant to California Code of Civil Procedure Section 1161(2), you are indebted to Landlord in the sum of $1,850.00 for past due rent.

WITHIN THREE (3) BUSINESS DAYS from service of this notice, excluding judicial holidays and weekends, you are required to either:
1. Pay the full sum of $1,850.00 to Landlord via cashier's check; or
2. Vacate and deliver complete possession of the premises to Landlord.

IF YOU FAIL TO COMPLY OR VACATE within three business days, legal proceedings in Unlawful Detainer will be initiated against you immediately. A judgment for forfeiture, statutory damages, and attorney's fees may be entered against you.

NOTICE: The landlord asserts the immediate right to change door locks and disconnect electrical utilities on day 4 if possession is not surrendered voluntarily.`,
  },
  {
    title: 'Employment Agreement & Wage Withholding',
    domain: LegalDomain.EMPLOYMENT_AND_LABOR,
    jurisdiction: 'California',
    text: `EMPLOYMENT TERMS AND COMPENSATION COVENANT

1. DUTIES & HOURS: Employee agrees to perform warehouse inventory supervision for 45 hours weekly at a flat semi-monthly compensation of $1,600.00. Employee agrees that statutory overtime provisions shall not apply.

2. WITHHOLDING OF FINAL PAYCHECK: In the event Employee terminates employment with less than 30 calendar days advance written notice, Employer reserves the right to retain 100% of final wages and earned accrued compensation as liquidated administrative turnover damages.

3. POST-EMPLOYMENT RESTRICTION: For 24 months following departure, Employee covenants not to work for or provide consulting to any business entity operating within 50 miles of Employer's headquarters.

4. UNIFORM & EQUIPMENT DEDUCTION: Employer shall deduct $120.00 per pay period directly from Employee's net pay for company vest and smartphone usage, regardless of minimum wage floors.`,
  },
  {
    title: 'Third-Party Medical Debt Collection Notice',
    domain: LegalDomain.CONSUMER_AND_DEBT,
    jurisdiction: 'General US',
    text: `NATIONAL RECOVERY ASSETS MANAGEMENT LLC
FINAL FORMAL DEMAND BEFORE JUDICIAL ACTION

Date of Notice: September 1, 2026
Account Number: NRM-89241-MED
Alleged Debtor: Jane Doe
Original Creditor: Regional Emergency Care Hospital
Alleged Balance Due: $2,450.00 plus $620.00 collection fee = $3,070.00

This is an attempt to collect a debt. You have 7 days to remit payment in full via wire transfer or credit card. 

IF PAYMENT IS NOT RECEIVED WITHIN SEVEN (7) DAYS:
- We will contact your employer's human resources payroll department to initiate immediate wage garnishment.
- We will notify local law enforcement authorities for referral of intentional non-payment.
- You have waived any right to dispute the original bill by failing to respond to prior correspondence.

All communications must be accompanied by payment.`,
  },
];

export const DocumentDemystifier: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [documentText, setDocumentText] = useState<string>(SAMPLE_DOCUMENTS[0].text);
  const [jurisdiction, setJurisdiction] = useState<string>(SAMPLE_DOCUMENTS[0].jurisdiction);
  const [domainHint, setDomainHint] = useState<LegalDomainType>(SAMPLE_DOCUMENTS[0].domain);
  const [executionMode, setExecutionMode] = useState<'standard' | 'loop'>('loop');

  // Execution State
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ExplainerDraft | null>(null);
  const [loopReceipt, setLoopReceipt] = useState<LoopExecutionReceipt | null>(null);
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load sample template into workbench
  const handleSelectSample = (idx: number) => {
    setSelectedSampleIndex(idx);
    const sample = SAMPLE_DOCUMENTS[idx];
    setDocumentText(sample.text);
    setJurisdiction(sample.jurisdiction);
    setDomainHint(sample.domain);
    setAnalysisResult(null);
    setLoopReceipt(null);
    setActiveClauseId(null);
    setErrorMsg(null);
  };

  // Run analysis (Standard Explainer or 5-stage Closed-Loop Engine)
  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!documentText.trim() || documentText.trim().length < 10) {
      setErrorMsg('Document text must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (executionMode === 'loop') {
        // Execute full 5-stage closed-loop pipeline
        const receipt = await executeCognitiveLoop({
          documentText,
          domainHint,
          jurisdiction,
          state: jurisdiction === 'New York' ? 'NY' : jurisdiction === 'Texas' ? 'TX' : 'CA',
          zipCode: '90012',
          maxIterations: 3,
        });
        setLoopReceipt(receipt);
        setAnalysisResult(receipt.verifiedAnalysis);
        if (receipt.verifiedAnalysis.predatoryClauses.length > 0) {
          setActiveClauseId(receipt.verifiedAnalysis.predatoryClauses[0].clauseId);
        }
      } else {
        // Execute standard 2-agent Generator-Critic explainer
        const draft = await analyzeContract({
          documentText,
          domainHint,
          jurisdiction,
        });
        setLoopReceipt(null);
        setAnalysisResult(draft);
        if (draft.predatoryClauses.length > 0) {
          setActiveClauseId(draft.predatoryClauses[0].clauseId);
        }
      }
    } catch (err: any) {
      console.error('Document analysis failed:', err);
      setErrorMsg(err.message || 'Failed to analyze document. Please check input text.');
    } finally {
      setLoading(false);
    }
  };

  const handleClauseClick = (clause: PredatoryClause) => {
    setActiveClauseId(clause.clauseId);
    if (clause.lineNumber) {
      const el = document.getElementById(`doc-line-${clause.lineNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Get active selected clause
  const clauses = analysisResult?.predatoryClauses || [];
  const activeClause = clauses.find((c) => c.clauseId === activeClauseId) || clauses[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header & Live Cognitive Loop Badge */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div>
          <div className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>find_in_page</span>
            <span>Document Demystifier & Predatory Clause Scanner</span>
          </div>
          <h1>Contract & Notice Demystifier</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.5rem' }}>
            Transform dense legal contracts, eviction notices, and agreements into clear 6th-grade English.
            Audited by the LexisLoop Senior Legal Critic Agent to ensure zero hallucinations and ABA Model Rule 5.5 ethics compliance.
          </p>
        </div>

        {/* Cognitive Pipeline Telemetry Card */}
        <div
          className="legal-card"
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--surface-container-low)',
            borderLeft: `4px solid ${loopReceipt ? 'var(--verified-green)' : 'var(--secondary)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ color: loopReceipt ? 'var(--verified-green)' : 'var(--secondary)' }}>
              {loopReceipt ? 'task_alt' : 'verified_user'}
            </span>
            <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
              {loopReceipt ? '5-Stage Closed-Loop Pipeline Verified' : 'Senior Legal Critic Agent Ready'}
            </strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
            {loopReceipt ? (
              <>
                Critic Audit Score: <strong style={{ color: 'var(--verified-green)' }}>{loopReceipt.finalAuditScore} / 100</strong> •{' '}
                Converged: <strong>{loopReceipt.converged ? 'YES (Pass)' : 'MAX ITERATIONS'}</strong> ({loopReceipt.totalIterations} iter in {loopReceipt.executionTimeMs}ms)
              </>
            ) : (
              '95+ Score Convergence Gate • Delimiter Sandboxed • Zero Raw PII Transmitted'
            )}
          </div>
        </div>
      </div>

      {/* 2. Document Workbench: Input, Templates & Mode Selector */}
      <div className="legal-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
              Load Real-World Legal Notice Templates:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {SAMPLE_DOCUMENTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn ${selectedSampleIndex === idx ? 'btn-dark' : 'btn-outline'}`}
                  style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => handleSelectSample(idx)}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Mode Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
              Engine Mode:
            </span>
            <button
              type="button"
              className={`btn ${executionMode === 'loop' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setExecutionMode('loop')}
              title="Executes 5-Stage Closed-Loop with Critic Audit & Pro Bono Clinic Matching"
            >
              🔄 Closed-Loop Audit (LoopEngine)
            </button>
            <button
              type="button"
              className={`btn ${executionMode === 'standard' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setExecutionMode('standard')}
              title="Fast Generator + Critic Explainer"
            >
              ⚡ Fast Explainer
            </button>
          </div>
        </div>

        {/* Inputs: Document Text & Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Jurisdiction / Governing State</label>
            <select
              className="form-select"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            >
              <option value="California">California (Cal. Civil Code & CCP)</option>
              <option value="New York">New York (NY Real Property Law & Labor Law)</option>
              <option value="Texas">Texas (Texas Property Code)</option>
              <option value="General US">General US (Uniform Acts & Federal Codes)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Legal Domain Hint</label>
            <select
              className="form-select"
              value={domainHint}
              onChange={(e) => setDomainHint(e.target.value as LegalDomainType)}
            >
              <option value={LegalDomain.TENANCY_AND_HOUSING}>Tenancy & Housing (Leases, Notices)</option>
              <option value={LegalDomain.EMPLOYMENT_AND_LABOR}>Employment & Labor (Wages, Non-Competes)</option>
              <option value={LegalDomain.CONSUMER_AND_DEBT}>Consumer & Debt (FDCPA, Loans)</option>
              <option value={LegalDomain.FAMILY_AND_DOMESTIC}>Family & Domestic</option>
              <option value={LegalDomain.CIVIL_RIGHTS_AND_IMMIGRATION}>Civil Rights & Immigration</option>
              <option value={LegalDomain.GENERAL_CIVIL}>General Civil</option>
            </select>
          </div>
        </div>

        {/* Document Editor Textarea */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Legal Document Text (Lease Agreement, Notice to Vacate, Wage Covenant, or Debt Letter)
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
              {documentText.length} characters • PII automatically scrubbed prior to inference
            </span>
          </div>
          <textarea
            className="form-textarea"
            rows={7}
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Paste raw contract, lease, or legal notice text here..."
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.6 }}
          />
        </div>

        {errorMsg && (
          <div className="legal-card-well" style={{ backgroundColor: 'var(--emergency-bg)', color: 'var(--emergency-text)', borderLeft: '4px solid var(--emergency-red)', marginBottom: '1rem' }}>
            <strong style={{ fontSize: '0.85rem' }}>Error: {errorMsg}</strong>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--verified-green)' }}>lock</span>
            <span>Zero raw client PII sent to language models (two-way cryptographic pseudonymization active).</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={() => handleAnalyze()}
            style={{ padding: '0.55rem 1.5rem', fontSize: '0.88rem' }}
          >
            {loading ? (
              <>
                <span className="live-dot"></span>
                <span>{executionMode === 'loop' ? 'Executing 5-Stage Closed Loop...' : 'Auditing Document...'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {executionMode === 'loop' ? 'sync' : 'search_check'}
                </span>
                <span>{executionMode === 'loop' ? 'Run Closed-Loop Cognitive Audit' : 'Analyze & Demystify Clauses'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Safe Fallback View for Unresolved Audit */}
      {loopReceipt?.status === 'unresolved' && loopReceipt.safeFallback ? (
        <div
          className="legal-card"
          style={{
            borderLeft: '4px solid #d97706',
            backgroundColor: '#fffbeb',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '28px' }}>
              gavel
            </span>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#92400e', marginBottom: '0.25rem' }}>
                Accuracy Standard Unresolved — Safe Fallback Activated
              </h2>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400e', fontWeight: 700 }}>
                Senior Legal Critic Gate: Reached Maximum Iterations ({loopReceipt.totalIterations})
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #fcd34d',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              lineHeight: 1.6,
              color: '#78350f',
              fontSize: '0.9rem',
            }}
          >
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>Ethical AI Guardrail Notice:</strong> {loopReceipt.safeFallback.disclaimer}
            </p>
            {loopReceipt.lastCriticFeedback && (
              <p style={{ fontSize: '0.82rem', color: '#92400e', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                Critic Audit Finding: "{loopReceipt.lastCriticFeedback}"
              </p>
            )}
            <p style={{ fontSize: '0.85rem' }}>
              {loopReceipt.safeFallback.generalEducationalInfo}
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/aid')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
              <span>Find Free Legal Aid Clinics</span>
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/analyze')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>menu_book</span>
              <span>Start a New Document Review</span>
            </button>
          </div>
        </div>
      ) : analysisResult ? (

        <>
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
                Detected Predatory & Unfavorable Clauses ({clauses.length}):
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {clauses.map((c) => (
                  <button
                    key={c.clauseId}
                    type="button"
                    className={`btn ${activeClauseId === c.clauseId ? 'btn-dark' : 'btn-outline'}`}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    onClick={() => handleClauseClick(c)}
                  >
                    <span className={c.riskTier === ClauseRiskTier.RED_PREDATORY ? 'live-dot-red' : 'live-dot'}></span>
                    <span>
                      {c.clauseId} ({c.riskTier === ClauseRiskTier.RED_PREDATORY ? 'Predatory' : 'Unfavorable'})
                    </span>
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
                <span>Print Redline</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                onClick={() => navigate('/action')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_document</span>
                <span>Draft Pro Se Demand Letter</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Split View */}
          <div className="split-view">
            {/* Left Pane: Original Document View with Clause Badges */}
            <div className="legal-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '760px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-faint)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>description</span>
                  <h2 style={{ fontSize: '1.15rem' }}>Original Contract Document</h2>
                </div>
                <span className="badge badge-indigo">{jurisdiction} Jurisdiction</span>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  backgroundColor: 'var(--surface-container-low)',
                  padding: '1.25rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: '1.8',
                  color: 'var(--on-surface)',
                  border: '1px solid var(--outline-faint)',
                }}
              >
                {documentText.split('\n').map((line, idx) => {
                  const lineNum = idx + 1;
                  // Check if any predatory clause matches this line
                  const matchingClause = clauses.find(
                    (c) =>
                      c.lineNumber === lineNum ||
                      (c.originalText && line.trim().length > 15 && c.originalText.includes(line.trim()))
                  );

                  return (
                    <div
                      key={idx}
                      id={`doc-line-${lineNum}`}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '0.2rem 0.4rem',
                        backgroundColor: matchingClause
                          ? matchingClause.riskTier === ClauseRiskTier.RED_PREDATORY
                            ? 'rgba(220, 38, 38, 0.12)'
                            : 'rgba(217, 119, 6, 0.12)'
                          : 'transparent',
                        borderLeft: matchingClause
                          ? `3px solid ${
                              matchingClause.riskTier === ClauseRiskTier.RED_PREDATORY
                                ? 'var(--emergency-red)'
                                : 'var(--caution-amber)'
                            }`
                          : '3px solid transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <span style={{ width: '28px', color: 'var(--outline)', userSelect: 'none', textAlign: 'right', flexShrink: 0 }}>
                        {lineNum}
                      </span>
                      <span style={{ flex: 1, whiteSpace: 'pre-wrap' }}>
                        {line || ' '}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Lines highlighted in Red indicate predatory / void clauses.</span>
                <span>Click any clause button above to inspect legal defects.</span>
              </div>
            </div>

            {/* Right Pane: Plain-English Translation & Defense Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Plain-Language Executive Summary */}
              <div className="legal-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>translate</span>
                    <h3 style={{ fontSize: '1.05rem' }}>Plain-English Translation Summary</h3>
                  </div>
                  <span className="badge badge-green">
                    Grade {analysisResult.readingGradeLevel} Reading Level
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--on-surface)' }}>
                  {analysisResult.plainLanguageSummary}
                </p>
              </div>

              {/* Active Predatory Clause Deep-Dive */}
              {activeClause && (
                <div
                  className="legal-card"
                  style={{
                    borderLeft: `5px solid ${
                      activeClause.riskTier === ClauseRiskTier.RED_PREDATORY
                        ? 'var(--emergency-red)'
                        : 'var(--caution-amber)'
                    }`,
                    backgroundColor:
                      activeClause.riskTier === ClauseRiskTier.RED_PREDATORY
                        ? 'var(--emergency-bg)'
                        : 'var(--caution-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          color:
                            activeClause.riskTier === ClauseRiskTier.RED_PREDATORY
                              ? 'var(--emergency-red)'
                              : 'var(--caution-amber)',
                        }}
                      >
                        gavel
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>
                        Clause Inspection: {activeClause.clauseId}
                      </strong>
                    </div>
                    <span
                      className={`badge ${
                        activeClause.riskTier === ClauseRiskTier.RED_PREDATORY ? 'badge-red' : 'badge-amber'
                      }`}
                    >
                      {activeClause.riskTier === ClauseRiskTier.RED_PREDATORY
                        ? 'PREDATORY / VOID CLAUSE'
                        : 'UNFAVORABLE / ONE-SIDED'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block' }}>
                        What This Actually Means in Everyday English:
                      </strong>
                      <p style={{ fontSize: '0.88rem', color: 'var(--on-surface)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                        {activeClause.plainMeaning}
                      </p>
                    </div>

                    <div className="legal-card-well" style={{ backgroundColor: '#ffffff', padding: '0.65rem 0.85rem' }}>
                      <strong style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--emergency-red)', display: 'block' }}>
                        Statutory Defect & Unenforceability:
                      </strong>
                      <p style={{ fontSize: '0.82rem', marginTop: '0.2rem', color: 'var(--on-surface)', fontStyle: 'italic' }}>
                        "{activeClause.statutoryDefect}"
                      </p>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block' }}>
                        Actionable Defense Recommendation:
                      </strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.2rem', fontWeight: 600 }}>
                        {activeClause.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assertable Statutory Rights */}
              {analysisResult.assertableRights && analysisResult.assertableRights.length > 0 && (
                <div className="legal-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--verified-green)' }}>shield</span>
                    <h3 style={{ fontSize: '1.05rem' }}>Assertable Statutory Rights Under {jurisdiction} Law</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analysisResult.assertableRights.map((right, idx) => (
                      <div key={idx} className="legal-card-well" style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{right.rightName}</strong>
                          <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{right.citation}</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                          {right.plainDescription}
                        </p>
                        <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
                          How to Assert: {right.howToAssert}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Checklist */}
              {analysisResult.actionChecklist && analysisResult.actionChecklist.length > 0 && (
                <div className="legal-card" style={{ borderTop: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>checklist</span>
                    <h3 style={{ fontSize: '1.05rem' }}>Citizen Action Checklist</h3>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {analysisResult.actionChecklist.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--verified-green)' }}>
                          check_box
                        </span>
                        <span style={{ color: 'var(--on-surface)', lineHeight: 1.4 }}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Matched Clinics from Loop Receipt */}
                  {loopReceipt && loopReceipt.recommendedClinics && loopReceipt.recommendedClinics.length > 0 && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--outline-faint)', paddingTop: '0.75rem' }}>
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.4rem' }}>
                        Auto-Matched Pro Bono Legal Clinics:
                      </strong>
                      {loopReceipt.recommendedClinics.slice(0, 2).map((clinic) => (
                        <div key={clinic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.3rem 0' }}>
                          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{clinic.name}</span>
                          <a href={`tel:${clinic.phone.replace(/[^0-9]/g, '')}`} style={{ color: 'var(--secondary)', textDecoration: 'none' }}>
                            {clinic.phone}
                          </a>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: '100%', fontSize: '0.75rem', marginTop: '0.5rem' }}
                        onClick={() => navigate('/aid')}
                      >
                        View Full Clinic Directory & Intake Packet
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="legal-card" style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'var(--surface-container-lowest)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline-variant)', marginBottom: '0.75rem' }}>
            auto_stories
          </span>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Ready to Demystify Your Legal Document
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', maxWidth: '580px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            Select one of the sample legal templates above, or paste your own residential lease, eviction summons, or employment agreement. Click <strong>Run Closed-Loop Cognitive Audit</strong> to inspect illegal clauses in real time.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleAnalyze()}
            style={{ padding: '0.65rem 1.75rem', fontSize: '0.9rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
            <span>Analyze Sample Lease Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
