import type { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/middlewares/authenticate';
import { PrismaRecentGamesRepository } from '../../infra/repositories/PrismaRecentGamesRepository';
import { GetRecentGamesUseCase } from '../../application/usecases/GetRecentGamesUseCase';
import { TrackRecentGameUseCase } from '../../application/usecases/TrackRecentGameUseCase';

export class RecentGamesController {
  async list(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    const repo = new PrismaRecentGamesRepository();
    const useCase = new GetRecentGamesUseCase(repo);
    const result = await useCase.execute(userId);

    res.json({ success: true, data: result });
  }

  async track(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { gameId } = req.body;

    const repo = new PrismaRecentGamesRepository();
    const useCase = new TrackRecentGameUseCase(repo);
    await useCase.execute(userId, gameId);

    res.json({ success: true, data: null });
  }
}
