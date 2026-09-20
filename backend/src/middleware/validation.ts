/**
 * JurisAccess AI - Generic Zod Schema Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types/api';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response<ApiResponse<never>>, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error as ZodError;
      const issues = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Request validation failed: ${issues}`,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

/** Require structured JSON for state-changing API requests. */
export function requireJson(req: Request, res: Response<ApiResponse<never>>, next: NextFunction): void {
  if (req.is('application/json')) {
    next();
    return;
  }

  res.status(415).json({
    success: false,
    error: {
      code: 'UNSUPPORTED_MEDIA_TYPE',
      message: 'Content-Type must be application/json.',
      timestamp: new Date().toISOString(),
    },
  });
}
