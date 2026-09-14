/**
 * JurisAccess AI - REST API Routes
 */

import { Router } from 'express';
import { TriageController } from '../controllers/triageController';
import { AnalysisController } from '../controllers/analysisController';
import { AidController } from '../controllers/aidController';
import { LoopController } from '../controllers/loopController';
import { validateBody } from '../middleware/validation';
import {
  TriageRequestSchema,
  AnalysisRequestSchema,
  LegalAidRequestSchema,
  ProSeLetterRequestSchema,
} from '../types/api';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'JurisAccess AI (LexisLoop)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 1. Legal Issue Triage & Urgency Evaluation
router.post('/triage', validateBody(TriageRequestSchema), TriageController.handleTriage);

// 2. Document Analysis & Clause Demystifier
router.post('/analyze-contract', validateBody(AnalysisRequestSchema), AnalysisController.handleAnalysis);

// 3. Pro Bono Legal Aid Matcher
router.post('/match-aid', validateBody(LegalAidRequestSchema), AidController.handleMatchAid);

// 4. Pro Se Legal Demand Notice Generator
router.post('/pro-se-letter', validateBody(ProSeLetterRequestSchema), AidController.handleProSeLetter);

// 5. Complete Closed-Loop Cognitive Pipeline
router.post('/loop-execute', validateBody(AnalysisRequestSchema), LoopController.handleExecute);

export default router;
