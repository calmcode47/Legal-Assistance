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
          details: error.format(),
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
