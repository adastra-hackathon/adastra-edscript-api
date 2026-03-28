import type { IFavoritesRepository, FavoriteGameData } from '../../domain/repositories/IFavoritesRepository';

export class GetFavoritesUseCase {
  constructor(private readonly repo: IFavoritesRepository) {}

  async execute(userId: string): Promise<FavoriteGameData[]> {
    return this.repo.findByUser(userId);
  }
}
