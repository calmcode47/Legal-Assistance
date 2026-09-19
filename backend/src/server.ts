/**
 * JurisAccess AI - Express Server & Render Web Service Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import apiRoutes from './routes/apiRoutes';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Path to frontend assets (Vite React dist bundle)
const distPath = path.resolve(__dirname, '../../frontend/dist');
const frontendPath = fs.existsSync(distPath) ? distPath : null;

// Security Middleware (Configured to support Google Fonts & Vite assets)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'http://localhost:*', 'https://*.onrender.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(rateLimiter);

// 1. API Routes
app.use('/api', apiRoutes);

// 2. Serve Static React Frontend & SPA Fallback
if (frontendPath) {
  app.use(express.static(frontendPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Standalone API discovery endpoint for isolated backend deployments
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
}

// Centralized Error Handler
app.use(errorHandler);

// Standalone server execution for Render, container runtimes, and local development
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : env.PORT;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n⚖️  JurisAccess AI active on http://localhost:${PORT}`);
    console.log(`🏛️  Frontend available at http://localhost:${PORT}/`);
    console.log(`🛡️  Backend API active at http://localhost:${PORT}/api/health`);
    console.log(`🔒  PII Redaction & Prompt Injection Guardrails Active`);
    console.log(`🔄  Loop Engineering Engine: Provider=${env.LLM_PROVIDER}\n`);
  });
}
