import { AddFavoriteUseCase } from '../AddFavoriteUseCase';
import { AppError } from '../../../../../shared/errors/AppError';
import type { IFavoritesRepository } from '../../../domain/repositories/IFavoritesRepository';

function makeRepo(existsResult: boolean = false): IFavoritesRepository {
  return {
    findByUser: jest.fn().mockResolvedValue([]),
    add: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(existsResult),
  };
}

describe('AddFavoriteUseCase', () => {
  it('adds a favorite successfully when it does not exist yet', async () => {
    const repo = makeRepo(false);
    const useCase = new AddFavoriteUseCase(repo);

    await expect(useCase.execute('user-1', 'game-1')).resolves.toBeUndefined();
    expect(repo.add).toHaveBeenCalledWith('user-1', 'game-1');
  });

  it('throws CONFLICT when the favorite already exists', async () => {
    const repo = makeRepo(true);
    const useCase = new AddFavoriteUseCase(repo);

    await expect(useCase.execute('user-1', 'game-1')).rejects.toThrow(AppError);
    await expect(useCase.execute('user-1', 'game-1')).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(repo.add).not.toHaveBeenCalled();
  });

  it('passes correct userId and gameId to repository', async () => {
    const repo = makeRepo(false);
    const useCase = new AddFavoriteUseCase(repo);

    await useCase.execute('user-xyz', 'game-abc');

    expect(repo.exists).toHaveBeenCalledWith('user-xyz', 'game-abc');
    expect(repo.add).toHaveBeenCalledWith('user-xyz', 'game-abc');
  });
});
