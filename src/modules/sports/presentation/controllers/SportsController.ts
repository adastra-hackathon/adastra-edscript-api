import type { Request, Response } from 'express';
import { PrismaSportsRepository } from '../../infra/repositories/PrismaSportsRepository';
import { GetSportsMatchesUseCase } from '../../application/usecases/GetSportsMatchesUseCase';
import { GetSportsMatchesQuerySchema } from '../../application/dtos/GetSportsMatchesDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class SportsController {
  async getMatches(req: Request, res: Response): Promise<void> {
    const parsed = GetSportsMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR');
    }

    const repo = new PrismaSportsRepository();
    const useCase = new GetSportsMatchesUseCase(repo);
    const result = await useCase.execute(parsed.data);

    res.json({ success: true, data: result });
  }
}
