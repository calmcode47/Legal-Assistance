/**
 * JurisAccess AI - fetchWithTimeout
 * Wraps native fetch with an AbortController so that cold-start delays (e.g. Render 50s spinup)
 * or network outages fail fast and cleanly into the deterministic offline fallback.
 */

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 7000,
  retries = 0
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      if ((response.status === 502 || response.status === 503) && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error('Network request failed after retries');
}
