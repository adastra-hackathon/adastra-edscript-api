import type { IFavoritesRepository } from '../../domain/repositories/IFavoritesRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class AddFavoriteUseCase {
  constructor(private readonly repo: IFavoritesRepository) {}

  async execute(userId: string, gameId: string): Promise<void> {
    const alreadyExists = await this.repo.exists(userId, gameId);
    if (alreadyExists) {
      throw new AppError('CONFLICT');
    }
    await this.repo.add(userId, gameId);
  }
}
