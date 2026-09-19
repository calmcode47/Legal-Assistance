/**
 * JurisAccess AI - Backend Activator Bot
 * 
 * Automatically wakes up and keeps the Render backend service warm.
 * Handles Render free-tier cold starts (sleeping after 15m inactivity)
 * by immediately detecting sleep, retrying in the background, updating
 * UI status, and maintaining a gentle keepalive ping while the user
 * is active.
 */

import { setApiStatus } from './apiStatus';
import { checkHealth } from './api';

let isActivating = false;
let keepaliveInterval: ReturnType<typeof setInterval> | null = null;
let pollTimeout: ReturnType<typeof setTimeout> | null = null;

// Keepalive heartbeat every 9.5 minutes (Render sleeps after 15 minutes of inactivity)
const KEEPALIVE_INTERVAL_MS = 9.5 * 60 * 1000;
const RETRY_POLL_INTERVAL_MS = 3500;
const MAX_ACTIVATION_ATTEMPTS = 20; // Up to ~70 seconds (well above typical 30-50s Render cold start)

/**
 * Activates the backend: pings /api/health and retries if it is waking up.
 */
export async function wakeBackend(): Promise<boolean> {
  if (isActivating) return false;
  isActivating = true;

  let attempts = 0;

  async function poll(): Promise<boolean> {
    attempts++;
    try {
      const health = await checkHealth();
      if (health && health.status === 'ok') {
        setApiStatus('live');
        isActivating = false;
        return true;
      }
    } catch {
      // still starting up
    }

    if (attempts < MAX_ACTIVATION_ATTEMPTS) {
      setApiStatus('activating');
      return new Promise((resolve) => {
        pollTimeout = setTimeout(async () => {
          resolve(await poll());
        }, RETRY_POLL_INTERVAL_MS);
      });
    } else {
      setApiStatus('offline');
      isActivating = false;
      return false;
    }
  }

  return await poll();
}

/**
 * Initializes the Backend Activator Bot:
 * - Triggers immediate wakeup on page load
 * - Listens for window focus / visibility change to re-verify or wake backend
 * - Sets a gentle keepalive heartbeat so backend stays alive while user is browsing
 */
export function initBackendActivator(): () => void {
  // 1. Initial wakeup check
  wakeBackend();

  // 2. Keepalive ping
  if (!keepaliveInterval) {
    keepaliveInterval = setInterval(() => {
      // Send lightweight ping if tab is open
      if (document.visibilityState === 'visible') {
        checkHealth().catch(() => {});
      }
    }, KEEPALIVE_INTERVAL_MS);
  }

  // 3. User returns to tab -> ensure backend is awake
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      wakeBackend();
    }
  };

  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleVisibilityChange);

  // Return cleanup function
  return () => {
    if (keepaliveInterval) {
      clearInterval(keepaliveInterval);
      keepaliveInterval = null;
    }
    if (pollTimeout) {
      clearTimeout(pollTimeout);
      pollTimeout = null;
    }
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleVisibilityChange);
    isActivating = false;
  };
}
