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
  const isMalformedJson = err instanceof SyntaxError && 'body' in err;
  const statusCode = isMalformedJson ? 400 : err.status || 500;
  const errorCode = isMalformedJson ? 'INVALID_JSON' : err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');

  console.error(`[JurisAccess Error] ${errorCode} (${statusCode}):`, err.message);

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      // Server failures can contain implementation or provider details. Keep those
      // details in server logs and return a stable, safe message to the client.
      message:
        statusCode >= 500
          ? 'An unexpected error occurred while processing your legal inquiry.'
          : isMalformedJson
            ? 'The request body must contain valid JSON.'
          : err.message || 'Your request could not be processed.',
      timestamp: new Date().toISOString(),
    },
  });
}
