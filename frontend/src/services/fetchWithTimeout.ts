/**
 * JurisAccess AI - fetchWithTimeout
 * Wraps native fetch with an AbortController so that cold-start delays (e.g. Render 50s spinup)
 * or network outages fail fast and cleanly into the deterministic offline fallback.
 */

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 7000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
