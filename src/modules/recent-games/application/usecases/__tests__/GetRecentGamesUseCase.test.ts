import { GetRecentGamesUseCase } from '../GetRecentGamesUseCase';
import type { IRecentGamesRepository, RecentGameData } from '../../../domain/repositories/IRecentGamesRepository';

const makeRecentGame = (overrides: Partial<RecentGameData> = {}): RecentGameData => ({
  id: 'rg-1',
  gameId: 'game-1',
  lastPlayedAt: new Date('2024-06-01T10:00:00Z'),
  game: {
    id: 'game-1',
    name: 'Fortune Ox',
    slug: 'fortune-ox',
    imageUrl: 'https://example.com/img.jpg',
    type: 'CASINO',
    isPopular: true,
    isNew: false,
    provider: { id: 'p-1', name: 'PG Soft', slug: 'pg-soft' },
  },
  ...overrides,
});

function makeRepo(recentGames: RecentGameData[] = []): IRecentGamesRepository {
  return {
    findByUser: jest.fn().mockResolvedValue(recentGames),
    upsert: jest.fn().mockResolvedValue(undefined),
    enforceLimit: jest.fn().mockResolvedValue(undefined),
  };
}

describe('GetRecentGamesUseCase', () => {
  it('returns list of recently played games for a user', async () => {
    const recentGames = [
      makeRecentGame(),
      makeRecentGame({ id: 'rg-2', gameId: 'game-2' }),
    ];
    const repo = makeRepo(recentGames);
    const useCase = new GetRecentGamesUseCase(repo);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(2);
    expect(result[0].game.name).toBe('Fortune Ox');
  });

  it('returns empty list when user has no recent games', async () => {
    const repo = makeRepo([]);
    const useCase = new GetRecentGamesUseCase(repo);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(0);
  });

  it('calls repository with userId and limit of 10', async () => {
    const repo = makeRepo([makeRecentGame()]);
    const useCase = new GetRecentGamesUseCase(repo);

    await useCase.execute('user-abc');

    expect(repo.findByUser).toHaveBeenCalledWith('user-abc', 10);
  });
});
