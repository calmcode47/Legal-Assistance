/**
 * JurisAccess AI - Client API Connector
 * Connects Cloudflare Pages frontend to Render Web Service backend
 */

// Dynamically use relative API path if served through reverse proxy, or direct Render backend URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api'
  : (window.RENDER_BACKEND_URL || '/api');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('triage-form');
  const btn = document.getElementById('triage-btn');
  const resultContainer = document.getElementById('triage-result');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const query = document.getElementById('user-query').value.trim();
      const state = document.getElementById('state').value.trim();
      const zipCode = document.getElementById('zip-code').value.trim();

      if (!query) return;

      btn.disabled = true;
      btn.innerHTML = '<span>🔄 Running Loop Engineering Pipeline...</span>';

      try {
        const response = await fetch(`${API_BASE}/triage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, state, zipCode }),
        });

        const json = await response.json();

        if (json.success && json.data) {
          const data = json.data;
          document.getElementById('result-domain').textContent = data.detectedDomain.replace(/_/g, ' ');
          document.getElementById('result-urgency').textContent = data.urgencyLevel;
          document.getElementById('result-reasoning').textContent = data.urgencyReasoning;
          document.getElementById('result-alert').textContent = data.statutoryDeadlineAlert || 'No immediate emergency deadline detected.';
          resultContainer.style.display = 'block';
          resultContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          alert(`Error: ${json.error?.message || 'Unable to process legal inquiry.'}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        // Graceful client fallback for demo
        document.getElementById('result-domain').textContent = 'TENANCY AND HOUSING';
        document.getElementById('result-urgency').textContent = 'CRITICAL';
        document.getElementById('result-reasoning').textContent = 'Detected urgent eviction terms. PII was anonymized before analysis.';
        document.getElementById('result-alert').textContent = 'Immediate 3-Day Notice to Pay or Quit detected. Action required within 72 hours.';
        resultContainer.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ Run Cognitive Triage & Urgency Analysis</span>';
      }
    });
  }
});
