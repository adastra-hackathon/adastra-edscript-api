import { TrackRecentGameUseCase } from '../TrackRecentGameUseCase';
import type { IRecentGamesRepository } from '../../../domain/repositories/IRecentGamesRepository';

function makeRepo(): IRecentGamesRepository {
  return {
    findByUser: jest.fn().mockResolvedValue([]),
    upsert: jest.fn().mockResolvedValue(undefined),
    enforceLimit: jest.fn().mockResolvedValue(undefined),
  };
}

describe('TrackRecentGameUseCase', () => {
  it('upserts the game record for the user', async () => {
    const repo = makeRepo();
    const useCase = new TrackRecentGameUseCase(repo);

    await useCase.execute('user-1', 'game-1');

    expect(repo.upsert).toHaveBeenCalledWith('user-1', 'game-1');
  });

  it('enforces the limit of 10 after upserting', async () => {
    const repo = makeRepo();
    const useCase = new TrackRecentGameUseCase(repo);

    await useCase.execute('user-1', 'game-1');

    expect(repo.enforceLimit).toHaveBeenCalledWith('user-1', 10);
  });

  it('calls upsert before enforceLimit', async () => {
    const callOrder: string[] = [];
    const repo: IRecentGamesRepository = {
      findByUser: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockImplementation(async () => { callOrder.push('upsert'); }),
      enforceLimit: jest.fn().mockImplementation(async () => { callOrder.push('enforceLimit'); }),
    };
    const useCase = new TrackRecentGameUseCase(repo);

    await useCase.execute('user-1', 'game-1');

    expect(callOrder).toEqual(['upsert', 'enforceLimit']);
  });

  it('passes correct userId and gameId to upsert', async () => {
    const repo = makeRepo();
    const useCase = new TrackRecentGameUseCase(repo);

    await useCase.execute('user-xyz', 'game-abc');

    expect(repo.upsert).toHaveBeenCalledWith('user-xyz', 'game-abc');
    expect(repo.enforceLimit).toHaveBeenCalledWith('user-xyz', 10);
  });
});
