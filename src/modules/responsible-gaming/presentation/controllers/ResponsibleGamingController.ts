import type { Response } from 'express';
import type { AuthenticatedRequest as Request } from '../../../../shared/middlewares/authenticate';
import { PrismaResponsibleGamingRepository } from '../../infra/repositories/PrismaResponsibleGamingRepository';
import { GetResponsibleGamingStateUseCase } from '../../application/usecases/GetResponsibleGamingStateUseCase';
import { UpsertBetLimitUseCase } from '../../application/usecases/UpsertBetLimitUseCase';
import { UpsertDepositLimitUseCase } from '../../application/usecases/UpsertDepositLimitUseCase';
import { UpsertSessionTimeLimitUseCase } from '../../application/usecases/UpsertSessionTimeLimitUseCase';
import { CreateTimedSelfExclusionUseCase } from '../../application/usecases/CreateTimedSelfExclusionUseCase';
import { CreateSelfExclusionUseCase } from '../../application/usecases/CreateSelfExclusionUseCase';
import { BetLimitSchema } from '../../application/dtos/BetLimitDTO';
import { DepositLimitSchema } from '../../application/dtos/DepositLimitDTO';
import { SessionTimeLimitSchema } from '../../application/dtos/SessionTimeLimitDTO';
import { TimedSelfExclusionSchema, SelfExclusionSchema } from '../../application/dtos/SelfExclusionDTO';
import { AppError } from '../../../../shared/errors/AppError';
import type { GamingLimitType } from '@prisma/client';

const repo = new PrismaResponsibleGamingRepository();

function ok(res: Response, data: unknown) {
  res.json({ success: true, data });
}

export class ResponsibleGamingController {
  async getState(req: Request, res: Response): Promise<void> {
    const useCase = new GetResponsibleGamingStateUseCase(repo);
    const data = await useCase.execute(req.userId);
    ok(res, data);
  }

  async upsertBetLimit(req: Request, res: Response): Promise<void> {
    const parsed = BetLimitSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const useCase = new UpsertBetLimitUseCase(repo);
    const data = await useCase.execute(req.userId, parsed.data);
    ok(res, data);
  }

  async upsertDepositLimit(req: Request, res: Response): Promise<void> {
    const parsed = DepositLimitSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const useCase = new UpsertDepositLimitUseCase(repo);
    const data = await useCase.execute(req.userId, parsed.data);
    ok(res, data);
  }

  async upsertSessionTimeLimit(req: Request, res: Response): Promise<void> {
    const parsed = SessionTimeLimitSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const useCase = new UpsertSessionTimeLimitUseCase(repo);
    const data = await useCase.execute(req.userId, parsed.data);
    ok(res, data);
  }

  async resetLimit(req: Request, res: Response): Promise<void> {
    const { type } = req.params;
    const valid: GamingLimitType[] = ['BET_AMOUNT', 'DEPOSIT_AMOUNT', 'TIME_ON_SITE'];
    if (!valid.includes(type as GamingLimitType)) throw new AppError('VALIDATION_ERROR');
    await repo.resetLimit(req.userId, type as GamingLimitType);
    res.json({ success: true });
  }

  async createTimedSelfExclusion(req: Request, res: Response): Promise<void> {
    const parsed = TimedSelfExclusionSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const useCase = new CreateTimedSelfExclusionUseCase(repo);
    const data = await useCase.execute(req.userId, parsed.data);
    ok(res, data);
  }

  async createSelfExclusion(req: Request, res: Response): Promise<void> {
    const parsed = SelfExclusionSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const useCase = new CreateSelfExclusionUseCase(repo);
    const data = await useCase.execute(req.userId, parsed.data);
    ok(res, data);
  }
}
