import type { IRecentGamesRepository } from '../../domain/repositories/IRecentGamesRepository';

const RECENT_GAMES_LIMIT = 10;

export class TrackRecentGameUseCase {
  constructor(private readonly repo: IRecentGamesRepository) {}

  async execute(userId: string, gameId: string): Promise<void> {
    await this.repo.upsert(userId, gameId);
    await this.repo.enforceLimit(userId, RECENT_GAMES_LIMIT);
  }
}
