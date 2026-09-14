/**
 * JurisAccess AI - Legal Aid & Pro Se Letter Controller
 */

import { Request, Response, NextFunction } from 'express';
import { LegalAidRequest, ProSeLetterRequest, ApiResponse } from '../types/api';
import { LegalAidClinic } from '../types/legal';
import { MatcherAgent, IntakeChecklistResult } from '../agents/matcherAgent';
import { LegalAidService } from '../services/legalAidService';

export class AidController {
  /**
   * Matches verified pro bono clinics and optionally prepares an intake checklist
   */
  public static async handleMatchAid(
    req: Request<unknown, unknown, LegalAidRequest>,
    res: Response<ApiResponse<{ clinics: LegalAidClinic[]; intakeChecklist?: IntakeChecklistResult }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await MatcherAgent.match(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates a formal Pro Se legal demand notice
   */
  public static handleProSeLetter(
    req: Request<unknown, unknown, ProSeLetterRequest>,
    res: Response<ApiResponse<{ letterText: string }>>,
    next: NextFunction
  ): void {
    try {
      const letterText = LegalAidService.generateProSeLetter(req.body);
      res.status(200).json({
        success: true,
        data: { letterText },
      });
    } catch (error) {
      next(error);
    }
  }
}
