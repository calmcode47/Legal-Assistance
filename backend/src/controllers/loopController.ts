/**
 * JurisAccess AI - Loop Engineering Orchestration Controller
 * Executes the complete 5-stage cognitive pipeline with self-correction telemetry.
 */

import { Request, Response, NextFunction } from 'express';
import { LoopExecutionRequest, ApiResponse } from '../types/api';
import { LoopExecutionReceipt } from '../types/agent';
import { LoopEngine } from '../agents/loopEngine';

export class LoopController {
  public static async handleExecute(
    req: Request<unknown, unknown, LoopExecutionRequest>,
    res: Response<ApiResponse<LoopExecutionReceipt>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { documentText, domainHint, jurisdiction, state, zipCode, maxIterations } = req.body;

      const receipt = await LoopEngine.execute({
        documentText,
        domainHint,
        jurisdiction,
        state,
        zipCode,
        maxIterations,
      });

      res.status(200).json({
        success: true,
        data: receipt,
      });
    } catch (error) {
      next(error);
    }
  }
}
