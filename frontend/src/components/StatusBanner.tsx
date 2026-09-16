import React from 'react';
import { useApiStatus } from '../services/useApiStatus';

/**
 * StatusBanner Component
 * Mounts once in Layout.tsx, directly under the existing emergency hotline banner.
 * Provides a visible indicator for whether the user is seeing live AI responses
 * or offline simulated data.
 */
export const StatusBanner: React.FC = () => {
  const status = useApiStatus();

  if (status === 'checking') {
    return (
      <div role="status" className="status-banner status-banner--checking">
        <span className="material-symbols-outlined status-banner-icon">sync</span>
        <span>Connecting to JurisAccess AI Cloud Service…</span>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div role="status" className="status-banner status-banner--offline">
        <span className="material-symbols-outlined status-banner-icon">cloud_off</span>
        <span>
          <strong>Offline demo mode:</strong> The live analysis service is currently unreachable (or waking up from sleep), so you are viewing verified educational simulations rather than live LLM generation. Live requests will resume automatically once connected.
        </span>
      </div>
    );
  }

  return (
    <div role="status" className="status-banner status-banner--live">
      <span className="material-symbols-outlined status-banner-icon">check_circle</span>
      <span>Live AI analysis connected • Gemini 2.0 Flash Legal Engine Active</span>
    </div>
  );
};
