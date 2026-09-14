/**
 * JurisAccess AI - Express Server & Firebase Cloud Functions Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { onRequest } from 'firebase-functions/v2/https';
import { env } from './config/env';
import apiRoutes from './routes/apiRoutes';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));
app.use(rateLimiter);

// API Routes
app.use('/api', apiRoutes);

// Root informational endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    platform: 'JurisAccess AI (LexisLoop)',
    mission: 'Empowering civil justice and legal assistance through Loop Engineering',
    status: 'ACTIVE',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Standalone server execution for local development and container runtimes
if (process.env.NODE_ENV !== 'test' && !process.env.FUNCTION_NAME && !process.env.K_SERVICE) {
  const PORT = env.PORT;
  app.listen(PORT, () => {
    console.log(`⚖️ JurisAccess AI backend listening on http://localhost:${PORT}`);
    console.log(`🔒 PII Redaction & Prompt Injection Guardrails Active`);
    console.log(`🔄 Loop Engineering Cognitive Engine Initialized (Provider: ${env.LLM_PROVIDER})`);
  });
}

// Firebase Cloud Function Export (2nd Gen HTTPS)
export const api = onRequest(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
    cors: true,
  },
  app
);
