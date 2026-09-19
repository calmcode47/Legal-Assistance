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
import { CONVERGENCE_THRESHOLD } from '../agents/loopEngine';
import { UPLGuard } from '../guardrails/uplGuard';

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

      // 3–4. Generate, audit, and refine. A rejected draft never leaves the
      // service, and the caller-selected limit is already constrained to <= 3.
      let finalDraft: ExplainerDraft | undefined;
      let isVerified = false;
      let criticFeedback: string[] | undefined;

      for (let iteration = 1; iteration <= req.body.maxIterations; iteration++) {
        const candidate = await ExplainerAgent.generateDraft({
          documentText: sanitizedText,
          domainHint,
          jurisdiction,
          iteration,
          criticFeedback,
        });
        finalDraft = candidate;

        const audit = await CriticAgent.auditDraft(candidate, sanitizedText);
        isVerified =
          audit.verdict === 'PASS' &&
          audit.scoreBreakdown.aggregateScore >= CONVERGENCE_THRESHOLD &&
          !audit.hasUplViolation &&
          !audit.hasHallucinatedCitation &&
          !UPLGuard.hasUplInfractions(candidate.plainLanguageSummary);

        if (isVerified) break;
        criticFeedback = audit.remediationInstructions;
      }

      if (!isVerified || !finalDraft) {
        res.status(200).json({
          success: true,
          data: {
            iterationNumber: req.body.maxIterations,
            plainLanguageSummary:
              'We could not verify a safe plain-language explanation for this document. Please contact a licensed attorney or a free legal aid clinic for help reviewing it.',
            readingGradeLevel: 5.8,
            predatoryClauses: [],
            assertableRights: [],
            actionChecklist: [
              'Keep the original notice and proof of when you received it.',
              'Contact a local legal aid clinic or licensed attorney for a document review.',
              'Do not rely on an unverified automated summary for a court deadline.',
            ],
            disclaimer: UPLGuard.wrapWithDisclaimers('', false),
          },
        });
        return;
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
