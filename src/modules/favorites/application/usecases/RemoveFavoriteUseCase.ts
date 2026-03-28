import type { IFavoritesRepository } from '../../domain/repositories/IFavoritesRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class RemoveFavoriteUseCase {
  constructor(private readonly repo: IFavoritesRepository) {}

  async execute(userId: string, gameId: string): Promise<void> {
    const exists = await this.repo.exists(userId, gameId);
    if (!exists) {
      throw new AppError('NOT_FOUND');
    }
    await this.repo.remove(userId, gameId);
  }
}
