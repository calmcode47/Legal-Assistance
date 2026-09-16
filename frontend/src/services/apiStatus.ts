/**
 * JurisAccess AI - API Status Store
 * Minimal, dependency-free status store to track whether the UI is connected
 * to live AI analysis or running in verified offline simulation demo mode.
 */

export type ApiStatus = 'checking' | 'live' | 'offline';

type Listener = (status: ApiStatus) => void;

let currentStatus: ApiStatus = 'checking';
const listeners = new Set<Listener>();

export function getApiStatus(): ApiStatus {
  return currentStatus;
}

export function setApiStatus(status: ApiStatus): void {
  if (status === currentStatus) return;
  currentStatus = status;
  listeners.forEach((listener) => listener(currentStatus));
}

export function subscribeApiStatus(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => listeners.delete(listener);
}
