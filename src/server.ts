/**
 * JurisAccess AI - Express Server & Render Web Service Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import apiRoutes from './routes/apiRoutes';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(rateLimiter);

// API Routes
app.use('/api', apiRoutes);

// Root informational endpoint for health and platform discovery
app.get('/', (_req, res) => {
  res.status(200).json({
    platform: 'JurisAccess AI (LexisLoop)',
    mission: 'Empowering civil justice and legal assistance through Loop Engineering',
    status: 'ACTIVE',
    runtime: 'Render Web Service',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Standalone server execution for Render, container runtimes, and local development
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : env.PORT;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚖️ JurisAccess AI backend active on Render/Local (Port: ${PORT})`);
    console.log(`🔒 PII Redaction & Prompt Injection Guardrails Active`);
    console.log(`🔄 Loop Engineering Cognitive Engine Initialized (Provider: ${env.LLM_PROVIDER})`);
  });
}
