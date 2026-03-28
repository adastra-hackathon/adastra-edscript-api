import { RemoveFavoriteUseCase } from '../RemoveFavoriteUseCase';
import { AppError } from '../../../../../shared/errors/AppError';
import type { IFavoritesRepository } from '../../../domain/repositories/IFavoritesRepository';

function makeRepo(existsResult: boolean = true): IFavoritesRepository {
  return {
    findByUser: jest.fn().mockResolvedValue([]),
    add: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(existsResult),
  };
}

describe('RemoveFavoriteUseCase', () => {
  it('removes a favorite successfully when it exists', async () => {
    const repo = makeRepo(true);
    const useCase = new RemoveFavoriteUseCase(repo);

    await expect(useCase.execute('user-1', 'game-1')).resolves.toBeUndefined();
    expect(repo.remove).toHaveBeenCalledWith('user-1', 'game-1');
  });

  it('throws NOT_FOUND when the favorite does not exist', async () => {
    const repo = makeRepo(false);
    const useCase = new RemoveFavoriteUseCase(repo);

    await expect(useCase.execute('user-1', 'game-1')).rejects.toThrow(AppError);
    await expect(useCase.execute('user-1', 'game-1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('passes correct userId and gameId to repository', async () => {
    const repo = makeRepo(true);
    const useCase = new RemoveFavoriteUseCase(repo);

    await useCase.execute('user-xyz', 'game-abc');

    expect(repo.exists).toHaveBeenCalledWith('user-xyz', 'game-abc');
    expect(repo.remove).toHaveBeenCalledWith('user-xyz', 'game-abc');
  });
});
