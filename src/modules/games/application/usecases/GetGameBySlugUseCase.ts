import type { IGamesRepository, GameDetailData } from '../../domain/repositories/IGamesRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class GetGameBySlugUseCase {
  constructor(private readonly repo: IGamesRepository) {}

  async execute(slug: string): Promise<GameDetailData> {
    const game = await this.repo.findGameBySlug(slug);
    if (!game) throw new AppError('NOT_FOUND');
    return game;
  }
}
