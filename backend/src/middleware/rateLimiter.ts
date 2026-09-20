/**
 * JurisAccess AI - In-Memory Sliding-Window Rate Limiter
 */

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../types/api';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap: Map<string, RateLimitRecord> = new Map();
const llmRequestMap: Map<string, RateLimitRecord> = new Map();
const MAX_TRACKED_IPS = 5000;
const MAX_LLM_REQUESTS_PER_WINDOW = 8;
const LLM_REQUEST_PATHS = new Set(['/api/analyze-contract', '/api/loop-execute']);

function pruneExpired(now: number): void {
  if (ipRequestMap.size < MAX_TRACKED_IPS / 2) {
    // Cheap path: occasional full prune when map grows
    return;
  }
  for (const [ip, record] of ipRequestMap) {
    if (now > record.resetTime) {
      ipRequestMap.delete(ip);
    }
  }
  // Hard cap to protect free-tier memory
  if (ipRequestMap.size > MAX_TRACKED_IPS) {
    const overflow = ipRequestMap.size - MAX_TRACKED_IPS;
    const keys = ipRequestMap.keys();
    for (let i = 0; i < overflow; i++) {
      const next = keys.next();
      if (next.done) break;
      ipRequestMap.delete(next.value);
    }
  }
  for (const [ip, record] of llmRequestMap) {
    if (now > record.resetTime) {
      llmRequestMap.delete(ip);
    }
  }
}

function exceedsLimit(
  records: Map<string, RateLimitRecord>,
  key: string,
  now: number,
  windowMs: number,
  maxRequests: number
): number | null {
  const record = records.get(key);
  if (!record || now > record.resetTime) {
    records.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  record.count++;
  return record.count > maxRequests ? Math.max(1, Math.ceil((record.resetTime - now) / 1000)) : null;
}

export function rateLimiter(
  req: Request,
  res: Response<ApiResponse<never>>,
  next: NextFunction
): void {
  if (env.NODE_ENV === 'test') {
    return next();
  }

  const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown-ip';
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

  pruneExpired(now);

  const retryAfterSeconds = exceedsLimit(ipRequestMap, clientIp, now, windowMs, maxRequests);
  if (retryAfterSeconds) {
    res.set('Retry-After', retryAfterSeconds.toString());
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many legal requests from this IP. Please wait a moment before trying again.',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  if (LLM_REQUEST_PATHS.has(req.path)) {
    const llmRetryAfter = exceedsLimit(llmRequestMap, clientIp, now, windowMs, MAX_LLM_REQUESTS_PER_WINDOW);
    if (llmRetryAfter) {
      res.set('Retry-After', llmRetryAfter.toString());
      res.status(429).json({
        success: false,
        error: {
          code: 'LLM_RATE_LIMIT_EXCEEDED',
          message: 'Analysis capacity is temporarily limited. Please wait before requesting another analysis.',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
  }

  return next();
}
