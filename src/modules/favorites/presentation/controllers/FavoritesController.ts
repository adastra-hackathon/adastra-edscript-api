import type { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/middlewares/authenticate';
import { PrismaFavoritesRepository } from '../../infra/repositories/PrismaFavoritesRepository';
import { GetFavoritesUseCase } from '../../application/usecases/GetFavoritesUseCase';
import { AddFavoriteUseCase } from '../../application/usecases/AddFavoriteUseCase';
import { RemoveFavoriteUseCase } from '../../application/usecases/RemoveFavoriteUseCase';

export class FavoritesController {
  async list(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    const repo = new PrismaFavoritesRepository();
    const useCase = new GetFavoritesUseCase(repo);
    const result = await useCase.execute(userId);

    res.json({ success: true, data: result });
  }

  async add(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { gameId } = req.body;

    const repo = new PrismaFavoritesRepository();
    const useCase = new AddFavoriteUseCase(repo);
    await useCase.execute(userId, gameId);

    res.json({ success: true, data: null });
  }

  async remove(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const gameId = req.params.gameId as string;

    const repo = new PrismaFavoritesRepository();
    const useCase = new RemoveFavoriteUseCase(repo);
    await useCase.execute(userId, gameId);

    res.json({ success: true, data: null });
  }
}
