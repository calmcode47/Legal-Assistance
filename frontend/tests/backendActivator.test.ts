import { describe, expect, it } from 'vitest';
import { isLiveBackend } from '../src/services/backendActivator';

describe('Backend activator health contract', () => {
  it('recognizes the backend HEALTHY status instead of retrying a live service', () => {
    expect(
      isLiveBackend({
        status: 'HEALTHY',
        service: 'JurisAccess AI (LexisLoop)',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      })
    ).toBe(true);
  });

  it('does not present offline simulation as a live backend', () => {
    expect(
      isLiveBackend({
        status: 'OFFLINE_SIMULATION',
        service: 'JurisAccess Client Fallback',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      })
    ).toBe(false);
  });
});
