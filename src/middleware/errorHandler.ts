/**
 * JurisAccess AI - Standardized Error Handling Middleware
 * Prevents stack trace leakage and returns uniform, accessible error envelopes.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api';

export function errorHandler(
  err: Error & { status?: number; code?: string },
  _req: Request,
  res: Response<ApiResponse<never>>,
  _next: NextFunction
): void {
  const statusCode = err.status || 500;
  const errorCode = err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');

  console.error(`[JurisAccess Error] ${errorCode} (${statusCode}):`, err.message);

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred while processing your legal inquiry.',
      timestamp: new Date().toISOString(),
    },
  });
}
