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

export function rateLimiter(
  req: Request,
  res: Response<ApiResponse<never>>,
  next: NextFunction
): void {
  // Bypass in test environment for continuous automated testing
  if (env.NODE_ENV === 'test') {
    return next();
  }

  const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown-ip';
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

  let record = ipRequestMap.get(clientIp);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    ipRequestMap.set(clientIp, record);
    return next();
  }

  record.count++;

  if (record.count > maxRequests) {
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

  return next();
}
