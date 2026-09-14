/**
 * JurisAccess AI - Document Analysis & Demystification Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AnalysisRequest, ApiResponse } from '../types/api';
import { ExplainerDraft } from '../types/agent';
import { ExplainerAgent } from '../agents/explainerAgent';
import { CriticAgent } from '../agents/criticAgent';
import { PIIScrubber } from '../guardrails/piiScrubber';
import { InjectionGuard } from '../guardrails/injectionGuard';

export class AnalysisController {
  public static async handleAnalysis(
    req: Request<unknown, unknown, AnalysisRequest>,
    res: Response<ApiResponse<ExplainerDraft>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { documentText, domainHint, jurisdiction } = req.body;

      // 1. Guard against prompt injection
      const scan = InjectionGuard.scan(documentText);
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
      const { sanitizedText, tokenMap } = PIIScrubber.sanitize(documentText);

      // 3. Generate candidate draft
      const draft = await ExplainerAgent.generateDraft({
        documentText: sanitizedText,
        domainHint,
        jurisdiction,
        iteration: 1,
      });

      // 4. Audit with Critic
      const audit = await CriticAgent.auditDraft(draft, sanitizedText);

      // If rejected, run one fast refinement
      let finalDraft = draft;
      if (audit.verdict === 'REJECT' && audit.remediationInstructions.length > 0) {
        finalDraft = await ExplainerAgent.generateDraft({
          documentText: sanitizedText,
          domainHint,
          jurisdiction,
          iteration: 2,
          criticFeedback: audit.remediationInstructions,
        });
      }

      // 5. De-tokenize on egress
      finalDraft.plainLanguageSummary = PIIScrubber.detokenize(finalDraft.plainLanguageSummary, tokenMap);
      finalDraft.actionChecklist = (finalDraft.actionChecklist || []).map((item) =>
        PIIScrubber.detokenize(item, tokenMap)
      );

      res.status(200).json({
        success: true,
        data: finalDraft,
      });
    } catch (error) {
      next(error);
    }
  }
}
