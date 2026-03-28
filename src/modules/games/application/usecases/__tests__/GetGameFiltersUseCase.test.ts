import { GetGameFiltersUseCase } from '../GetGameFiltersUseCase';
import type { IGamesRepository, ProviderData, CategoryData } from '../../../domain/repositories/IGamesRepository';

const providers: ProviderData[] = [
  { id: 'p-1', name: 'Evolution', slug: 'evolution', logoUrl: null },
  { id: 'p-2', name: 'PG Soft', slug: 'pg-soft', logoUrl: null },
];

const categories: CategoryData[] = [
  { id: 'c-1', name: 'Populares', slug: 'populares', icon: '🔥', sortOrder: 1, gameCount: 12 },
  { id: 'c-2', name: 'Roleta', slug: 'roleta', icon: '🎡', sortOrder: 7, gameCount: 5 },
];

function makeRepo(): IGamesRepository {
  return {
    findGames: jest.fn(),
    findActiveProviders: jest.fn().mockResolvedValue(providers),
    findActiveCategories: jest.fn().mockResolvedValue(categories),
    findGameBySlug: jest.fn().mockResolvedValue(null),
  };
}

describe('GetGameFiltersUseCase', () => {
  it('returns providers and categories together', async () => {
    const repo = makeRepo();
    const useCase = new GetGameFiltersUseCase(repo);

    const result = await useCase.execute();

    expect(result.providers).toEqual(providers);
    expect(result.categories).toEqual(categories);
  });

  it('calls both repository methods in parallel', async () => {
    const repo = makeRepo();
    const useCase = new GetGameFiltersUseCase(repo);

    await useCase.execute();

    expect(repo.findActiveProviders).toHaveBeenCalledTimes(1);
    expect(repo.findActiveCategories).toHaveBeenCalledTimes(1);
  });

  it('returns empty arrays when no active data', async () => {
    const repo: IGamesRepository = {
      findGames: jest.fn(),
      findActiveProviders: jest.fn().mockResolvedValue([]),
      findActiveCategories: jest.fn().mockResolvedValue([]),
      findGameBySlug: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetGameFiltersUseCase(repo);

    const result = await useCase.execute();

    expect(result.providers).toHaveLength(0);
    expect(result.categories).toHaveLength(0);
  });

  it('includes gameCount per category', async () => {
    const repo = makeRepo();
    const useCase = new GetGameFiltersUseCase(repo);

    const result = await useCase.execute();

    expect(result.categories[0].gameCount).toBe(12);
    expect(result.categories[1].gameCount).toBe(5);
  });
});
