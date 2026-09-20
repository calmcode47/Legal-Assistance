/**
 * JurisAccess AI - Environment Configuration & Validation
 */

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from current directory, root workspace, and backend root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('8080'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  LLM_PROVIDER: z.enum(['gemini', 'mock']).default('mock'),
  LLM_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).default(8000),
  LLM_CIRCUIT_BREAKER_MS: z.coerce.number().int().min(1000).max(300000).default(60000),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).default('60'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
}).superRefine((config, context) => {
  if (config.NODE_ENV === 'production' && config.CORS_ORIGIN === '*') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CORS_ORIGIN'],
      message: 'CORS_ORIGIN must be an exact frontend origin in production; wildcards are not allowed.',
    });
  }
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
