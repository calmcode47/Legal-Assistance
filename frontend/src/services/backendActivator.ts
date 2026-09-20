/**
 * JurisAccess AI - Backend Activator Bot
 *
 * Wakes Render free-tier backend on page load and keeps it warm with
 * credit-conscious keepalive pings (Render sleeps after ~15m inactivity).
 */

import { setApiStatus } from './apiStatus';
import { checkHealth, HealthStatus } from './api';

let isActivating = false;
let keepaliveInterval: ReturnType<typeof setInterval> | null = null;
let pollTimeout: ReturnType<typeof setTimeout> | null = null;
let lastSuccessfulPing = 0;

// Keepalive every 10 minutes — enough to prevent 15m sleep, conserves free-tier credits
const KEEPALIVE_INTERVAL_MS = 10 * 60 * 1000;
const RETRY_POLL_INTERVAL_MS = 4000;
const MAX_ACTIVATION_ATTEMPTS = 12; // ~48s covers typical Render cold starts
const FOCUS_REWAKE_COOLDOWN_MS = 60_000;

export function isLiveBackend(health: HealthStatus): boolean {
  return health.status === 'HEALTHY';
}

async function pingOnce(onHealth?: (health: HealthStatus) => void): Promise<boolean> {
  try {
    const health = await checkHealth();
    onHealth?.(health);
    if (isLiveBackend(health)) {
      setApiStatus('live');
      lastSuccessfulPing = Date.now();
      return true;
    }
  } catch {
    // still starting
  }
  return false;
}

/**
 * Activates the backend: pings /api/health and retries if it is waking up.
 */
export async function wakeBackend(onHealth?: (health: HealthStatus) => void): Promise<boolean> {
  if (isActivating) return false;
  isActivating = true;

  let attempts = 0;

  async function poll(): Promise<boolean> {
    attempts++;
    const live = await pingOnce(onHealth);
    if (live) {
      isActivating = false;
      return true;
    }

    if (attempts < MAX_ACTIVATION_ATTEMPTS) {
      setApiStatus('activating');
      return new Promise((resolve) => {
        pollTimeout = setTimeout(async () => {
          resolve(await poll());
        }, RETRY_POLL_INTERVAL_MS);
      });
    }

    setApiStatus('offline');
    isActivating = false;
    return false;
  }

  return await poll();
}

/**
 * Lightweight keepalive — single health ping, no multi-attempt storm.
 */
async function keepalivePing(onHealth?: (health: HealthStatus) => void): Promise<void> {
  if (isActivating) return;
  const live = await pingOnce(onHealth);
  if (!live) {
    void wakeBackend(onHealth);
  }
}

/**
 * Initializes the Backend Activator Bot.
 */
export function initBackendActivator(onHealth?: (health: HealthStatus) => void): () => void {
  void wakeBackend(onHealth);

  if (!keepaliveInterval) {
    keepaliveInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void keepalivePing(onHealth);
      }
    }, KEEPALIVE_INTERVAL_MS);
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return;
    const sinceLast = Date.now() - lastSuccessfulPing;
    if (sinceLast < FOCUS_REWAKE_COOLDOWN_MS) return;
    void wakeBackend(onHealth);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    if (keepaliveInterval) {
      clearInterval(keepaliveInterval);
      keepaliveInterval = null;
    }
    if (pollTimeout) {
      clearTimeout(pollTimeout);
      pollTimeout = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    isActivating = false;
  };
}
