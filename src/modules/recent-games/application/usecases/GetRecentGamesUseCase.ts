import type { IRecentGamesRepository, RecentGameData } from '../../domain/repositories/IRecentGamesRepository';

export class GetRecentGamesUseCase {
  constructor(private readonly repo: IRecentGamesRepository) {}

  async execute(userId: string): Promise<RecentGameData[]> {
    return this.repo.findByUser(userId, 10);
  }
}
