import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HealthStatus } from '../services/api';
import { initBackendActivator } from '../services/backendActivator';
import { StatusBanner } from './StatusBanner';

export const Layout: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = initBackendActivator(setHealth);
    return cleanup;
  }, []);

  // Double-Escape returns the user to Emergency Triage (crisis exit path)
  useEffect(() => {
    let lastEscapeAt = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const now = Date.now();
      if (now - lastEscapeAt < 900) {
        navigate('/');
        const main = document.getElementById('main-content');
        main?.focus();
      }
      lastEscapeAt = now;
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--surface)' }}>
        <div
          role="alert"
          style={{
            backgroundColor: 'var(--emergency-bg)',
            borderBottom: '1px solid var(--emergency-border)',
            color: 'var(--emergency-text)',
            padding: '0.4rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--emergency-red)', fontSize: '18px' }}>
              warning
            </span>
            <span>
              Facing illegal lockout, physical eviction, or immediate court notice? Call 2-1-1 or visit LawHelp.org. Domestic violence: 1-800-799-7233.
            </span>
          </div>
          <a
            href="tel:211"
            className="btn btn-emergency"
            style={{ padding: '0.2rem 0.75rem', fontSize: '0.72rem', whiteSpace: 'nowrap', minHeight: '44px' }}
            aria-label="Call 211 for emergency community and legal aid referral"
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '14px' }}>call</span>
            <span>Call 211</span>
          </a>
        </div>

        <StatusBanner />

        <div
          style={{
            height: '60px',
            backgroundColor: 'var(--surface-container-lowest)',
            borderBottom: '1px solid var(--outline-faint)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }} aria-label="JurisAccess AI home">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '22px' }}>balance</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1 }}>
                  JurisAccess.AI
                </span>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                  Civil Justice Intelligence
                </span>
              </div>
            </NavLink>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} aria-label="Main Navigation">
              {[
                { to: '/', label: 'Emergency Triage' },
                { to: '/analyze', label: 'Document Demystifier' },
                { to: '/aid', label: 'Legal Aid Locator' },
                { to: '/action', label: 'Demand Letter Builder' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                    transition: 'all 0.15s ease',
                    color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                    backgroundColor: isActive ? 'var(--surface-container)' : 'transparent',
                    borderBottom: isActive ? '2px solid var(--secondary)' : '2px solid transparent',
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="badge badge-green" style={{ padding: '0.35rem 0.65rem' }}>
              <span className="live-dot" aria-hidden="true"></span>
              <span>PII Redaction Active</span>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderBottom: '1px solid var(--outline-faint)',
            padding: '0.45rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--on-surface-variant)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--verified-green)', fontSize: '16px' }}>
              verified
            </span>
            <span style={{ color: 'var(--on-surface)', fontWeight: 700 }}>Active Civil Legal Aid Core</span>
            <span aria-hidden="true">•</span>
            <span>{health ? `${health.service} (${health.status})` : 'Connecting to LexisLoop...'}</span>
            <span aria-hidden="true">•</span>
            <span>Focus jurisdictions: CA / NY / TX + federal FDCPA/FLSA</span>
            <span aria-hidden="true">•</span>
            <span style={{ color: 'var(--verified-green)' }}>PII redacted before analysis</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--verified-green)' }}>
            <span className="live-dot" aria-hidden="true"></span>
            <span>{health?.status === 'HEALTHY' ? 'AI Engine Live' : 'Encrypted Sandbox'}</span>
          </div>
        </div>
      </header>

      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer
        className="no-print"
        style={{
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          borderTop: '1px solid var(--outline)',
          padding: '3rem 1.5rem 2rem 1.5rem',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem' }}>
            <div style={{ maxWidth: '420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '24px', color: '#c4c1fb' }}>gavel</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', fontWeight: 600 }}>JurisAccess AI</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#c8c5d0', lineHeight: 1.6 }}>
                LexisLoop Cognitive Intelligence architecture designed to dismantle systemic barriers to civil justice.
                Providing free, confidential statutory guidance, clause analysis, and pro se court document formatting for all citizens.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Modules</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <li><NavLink to="/" style={{ color: '#c8c5d0', textDecoration: 'none' }}>Emergency Triage</NavLink></li>
                  <li><NavLink to="/analyze" style={{ color: '#c8c5d0', textDecoration: 'none' }}>Document Demystifier</NavLink></li>
                  <li><NavLink to="/aid" style={{ color: '#c8c5d0', textDecoration: 'none' }}>Legal Aid Locator</NavLink></li>
                  <li><NavLink to="/action" style={{ color: '#c8c5d0', textDecoration: 'none' }}>Demand Letter Builder</NavLink></li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Legal Aid Resources</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#c8c5d0' }}>
                  <li>Legal Services Corporation (LSC)</li>
                  <li><a href="https://www.lawhelp.org" style={{ color: '#c8c5d0' }} target="_blank" rel="noreferrer">LawHelp.org</a></li>
                  <li>Consumer Financial Protection Bureau (CFPB)</li>
                  <li>National Domestic Violence Hotline (1-800-799-7233)</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(200, 197, 208, 0.2)',
              paddingTop: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.75rem',
              color: '#a09fad',
            }}
          >
            <p>
              <strong>Disclaimer:</strong> JurisAccess AI is an automated educational tool, not an attorney. Use of this platform does not constitute legal advice or establish an attorney-client relationship. If facing an imminent court trial or lockout, consult with a licensed attorney or legal aid organization immediately.
            </p>
            <div>WCAG 2.1 AA Compliant • PII Tokenized Before Inference • Double-Esc returns to triage</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
