import { GetGameBySlugUseCase } from '../GetGameBySlugUseCase';
import { AppError } from '../../../../../shared/errors/AppError';
import type {
  IGamesRepository,
  GameDetailData,
} from '../../../domain/repositories/IGamesRepository';

const makeDetailGame = (overrides: Partial<GameDetailData> = {}): GameDetailData => ({
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
  description: 'An exciting slot game.',
  rtp: 96.7,
  volatility: 'HIGH',
  minBet: 0.2,
  maxBet: 200,
  dealerName: null,
  playersCount: null,
  ...overrides,
});

function makeRepo(game: GameDetailData | null): IGamesRepository {
  return {
    findGames: jest.fn().mockResolvedValue({ games: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    findActiveProviders: jest.fn().mockResolvedValue([]),
    findActiveCategories: jest.fn().mockResolvedValue([]),
    findGameBySlug: jest.fn().mockResolvedValue(game),
  };
}

describe('GetGameBySlugUseCase', () => {
  it('returns game detail when slug exists', async () => {
    const game = makeDetailGame();
    const repo = makeRepo(game);
    const useCase = new GetGameBySlugUseCase(repo);

    const result = await useCase.execute('fortune-ox');

    expect(result).toEqual(game);
    expect(repo.findGameBySlug).toHaveBeenCalledWith('fortune-ox');
  });

  it('throws NOT_FOUND when slug does not match any game', async () => {
    const repo = makeRepo(null);
    const useCase = new GetGameBySlugUseCase(repo);

    await expect(useCase.execute('nonexistent-slug')).rejects.toThrow(AppError);
    await expect(useCase.execute('nonexistent-slug')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.findGameBySlug).toHaveBeenCalledWith('nonexistent-slug');
  });

  it('returns all extended detail fields (rtp, volatility, minBet, maxBet)', async () => {
    const game = makeDetailGame({ rtp: 97.5, volatility: 'LOW', minBet: 0.1, maxBet: 500 });
    const repo = makeRepo(game);
    const useCase = new GetGameBySlugUseCase(repo);

    const result = await useCase.execute('fortune-ox');

    expect(result.rtp).toBe(97.5);
    expect(result.volatility).toBe('LOW');
    expect(result.minBet).toBe(0.1);
    expect(result.maxBet).toBe(500);
    expect(result.description).toBe('An exciting slot game.');
  });

  it('returns live casino game with dealer and players info', async () => {
    const liveGame = makeDetailGame({
      type: 'LIVE_CASINO',
      name: 'Lightning Roulette',
      slug: 'lightning-roulette',
      dealerName: 'Carlos',
      playersCount: 87,
    });
    const repo = makeRepo(liveGame);
    const useCase = new GetGameBySlugUseCase(repo);

    const result = await useCase.execute('lightning-roulette');

    expect(result.type).toBe('LIVE_CASINO');
    expect(result.dealerName).toBe('Carlos');
    expect(result.playersCount).toBe(87);
  });

  it('handles game with all nullable detail fields as null', async () => {
    const game = makeDetailGame({
      description: null,
      rtp: null,
      volatility: null,
      minBet: null,
      maxBet: null,
      dealerName: null,
      playersCount: null,
    });
    const repo = makeRepo(game);
    const useCase = new GetGameBySlugUseCase(repo);

    const result = await useCase.execute('fortune-ox');

    expect(result.rtp).toBeNull();
    expect(result.volatility).toBeNull();
    expect(result.description).toBeNull();
  });

  it('does not call other repository methods', async () => {
    const repo = makeRepo(makeDetailGame());
    const useCase = new GetGameBySlugUseCase(repo);

    await useCase.execute('fortune-ox');

    expect(repo.findGames).not.toHaveBeenCalled();
    expect(repo.findActiveProviders).not.toHaveBeenCalled();
    expect(repo.findActiveCategories).not.toHaveBeenCalled();
  });
});
