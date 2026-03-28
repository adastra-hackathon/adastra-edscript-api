import type { IGamesRepository, GameFilters, PaginatedGames } from '../../domain/repositories/IGamesRepository';

export class GetGamesUseCase {
  constructor(private readonly repo: IGamesRepository) {}

  async execute(filters: GameFilters): Promise<PaginatedGames> {
    return this.repo.findGames(filters);
  }
}
