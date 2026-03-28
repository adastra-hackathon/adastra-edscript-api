import { GetGamesUseCase } from '../GetGamesUseCase';
import type { IGamesRepository, PaginatedGames, GameData } from '../../../domain/repositories/IGamesRepository';

const makeGame = (overrides: Partial<GameData> = {}): GameData => ({
  id: 'game-1',
  name: 'Fortune Ox',
  slug: 'fortune-ox',
  imageUrl: 'https://example.com/img.jpg',
  type: 'CASINO',
  isPopular: true,
  isNew: false,
  sortOrder: 1,
  provider: { id: 'p-1', name: 'PG Soft', slug: 'pg-soft' },
  categories: [{ id: 'c-1', name: 'Populares', slug: 'populares' }],
  ...overrides,
});

const makePaginated = (games: GameData[], total = games.length): PaginatedGames => ({
  games,
  total,
  page: 1,
  limit: 20,
  totalPages: Math.ceil(total / 20),
});

function makeRepo(result: PaginatedGames): IGamesRepository {
  return {
    findGames: jest.fn().mockResolvedValue(result),
    findActiveProviders: jest.fn().mockResolvedValue([]),
    findActiveCategories: jest.fn().mockResolvedValue([]),
    findGameBySlug: jest.fn().mockResolvedValue(null),
  };
}

describe('GetGamesUseCase', () => {
  it('returns paginated games from repository', async () => {
    const game = makeGame();
    const paginated = makePaginated([game]);
    const repo = makeRepo(paginated);
    const useCase = new GetGamesUseCase(repo);

    const result = await useCase.execute({ type: 'CASINO', page: 1, limit: 20 });

    expect(result.games).toHaveLength(1);
    expect(result.games[0].name).toBe('Fortune Ox');
    expect(repo.findGames).toHaveBeenCalledWith({ type: 'CASINO', page: 1, limit: 20 });
  });

  it('passes all filter params to repository', async () => {
    const repo = makeRepo(makePaginated([]));
    const useCase = new GetGamesUseCase(repo);
    const filters = {
      type: 'CASINO' as const,
      search: 'fortune',
      providers: ['pg-soft'],
      categories: ['populares'],
      sort: 'a-z' as const,
      page: 2,
      limit: 10,
    };

    await useCase.execute(filters);

    expect(repo.findGames).toHaveBeenCalledWith(filters);
  });

  it('returns correct pagination metadata', async () => {
    const games = Array.from({ length: 5 }, (_, i) => makeGame({ id: `g-${i}`, slug: `game-${i}` }));
    const repo = makeRepo(makePaginated(games, 45));
    const useCase = new GetGamesUseCase(repo);

    const result = await useCase.execute({ page: 1, limit: 5 });

    expect(result.total).toBe(45);
    expect(result.totalPages).toBe(3);
    expect(result.games).toHaveLength(5);
  });

  it('returns empty list when no games match filters', async () => {
    const repo = makeRepo(makePaginated([], 0));
    const useCase = new GetGamesUseCase(repo);

    const result = await useCase.execute({ search: 'nonexistent' });

    expect(result.games).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('returns live casino games', async () => {
    const liveGame = makeGame({ type: 'LIVE_CASINO', name: 'Lightning Roulette' });
    const repo = makeRepo(makePaginated([liveGame]));
    const useCase = new GetGamesUseCase(repo);

    const result = await useCase.execute({ type: 'LIVE_CASINO' });

    expect(result.games[0].type).toBe('LIVE_CASINO');
  });
});
