/**
 * JurisAccess AI - Triage Controller
 */

import { Request, Response, NextFunction } from 'express';
import { TriageRequest, ApiResponse } from '../types/api';
import { TriageResult } from '../types/agent';
import { TriageAgent } from '../agents/triageAgent';
import { PIIScrubber } from '../guardrails/piiScrubber';
import { InjectionGuard } from '../guardrails/injectionGuard';

export class TriageController {
  public static async handleTriage(
    req: Request<unknown, unknown, TriageRequest>,
    res: Response<ApiResponse<TriageResult>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { query, state, zipCode, domainHint } = req.body;

      // 1. Guard against prompt injection
      const scan = InjectionGuard.scan(query);
      if (!scan.isSafe) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SECURITY_VIOLATION',
            message: scan.detectedThreat || 'Adversarial prompt detected.',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 2. Pre-sanitize PII
      const { sanitizedText } = PIIScrubber.sanitize(query);

      // 3. Triage (honors litigant-selected domainHint when provided)
      const result = await TriageAgent.triage(sanitizedText, state, zipCode, domainHint);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
