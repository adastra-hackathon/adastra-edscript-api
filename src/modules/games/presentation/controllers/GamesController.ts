import type { Request, Response } from 'express';
import { GetGamesUseCase } from '../../application/usecases/GetGamesUseCase';
import { GetGameFiltersUseCase } from '../../application/usecases/GetGameFiltersUseCase';
import { GetGameBySlugUseCase } from '../../application/usecases/GetGameBySlugUseCase';
import { PrismaGamesRepository } from '../../infra/repositories/PrismaGamesRepository';
import { GetGamesQuerySchema } from '../../application/dtos/GetGamesDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class GamesController {
  async getGames(req: Request, res: Response): Promise<void> {
    const parsed = GetGamesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR');
    }

    const repo = new PrismaGamesRepository();
    const useCase = new GetGamesUseCase(repo);
    const result = await useCase.execute(parsed.data);

    res.json({ success: true, data: result });
  }

  async getFilters(_req: Request, res: Response): Promise<void> {
    const repo = new PrismaGamesRepository();
    const useCase = new GetGameFiltersUseCase(repo);
    const result = await useCase.execute();

    res.json({ success: true, data: result });
  }

  async getGameBySlug(req: Request, res: Response): Promise<void> {
    const slug = req.params.slug as string;
    const repo = new PrismaGamesRepository();
    const useCase = new GetGameBySlugUseCase(repo);
    const result = await useCase.execute(slug);

    res.json({ success: true, data: result });
  }
}
