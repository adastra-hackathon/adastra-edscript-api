import { GetFavoritesUseCase } from '../GetFavoritesUseCase';
import type { IFavoritesRepository, FavoriteGameData } from '../../../domain/repositories/IFavoritesRepository';

const makeFavoriteGame = (overrides: Partial<FavoriteGameData> = {}): FavoriteGameData => ({
  id: 'fav-1',
  gameId: 'game-1',
  createdAt: new Date('2024-01-01'),
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

function makeRepo(favorites: FavoriteGameData[] = []): IFavoritesRepository {
  return {
    findByUser: jest.fn().mockResolvedValue(favorites),
    add: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(false),
  };
}

describe('GetFavoritesUseCase', () => {
  it('returns list of favorite games for a user', async () => {
    const favorites = [makeFavoriteGame(), makeFavoriteGame({ id: 'fav-2', gameId: 'game-2' })];
    const repo = makeRepo(favorites);
    const useCase = new GetFavoritesUseCase(repo);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(2);
    expect(result[0].game.name).toBe('Fortune Ox');
  });

  it('returns empty list when user has no favorites', async () => {
    const repo = makeRepo([]);
    const useCase = new GetFavoritesUseCase(repo);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(0);
  });

  it('passes userId correctly to repository', async () => {
    const repo = makeRepo([makeFavoriteGame()]);
    const useCase = new GetFavoritesUseCase(repo);

    await useCase.execute('user-abc');

    expect(repo.findByUser).toHaveBeenCalledWith('user-abc');
  });
});
