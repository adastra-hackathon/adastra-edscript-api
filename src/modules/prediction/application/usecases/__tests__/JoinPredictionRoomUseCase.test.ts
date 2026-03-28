import { JoinPredictionRoomUseCase } from '../JoinPredictionRoomUseCase';
import type { IPredictionRoomRepository, PredictionRoomData } from '../../../domain/repositories/IPredictionRoomRepository';

function makeRoom(overrides: Partial<PredictionRoomData> = {}): PredictionRoomData {
  return {
    id: 'room-1', hostId: 'host-1', title: 'Test', entryAmount: 20, maxPlayers: 4,
    status: 'WAITING', predictionsDeadline: null, prizePool: 20, platformFee: 1,
    winnerId: null, isSimulation: false, createdAt: new Date(), updatedAt: new Date(),
    players: [], events: [],
    ...overrides,
  };
}

function makeRepo(room: PredictionRoomData | null): IPredictionRoomRepository {
  return {
    create: jest.fn(),
    findById: jest.fn().mockResolvedValue(room),
    findAll: jest.fn(),
    addPlayer: jest.fn().mockResolvedValue(room),
    start: jest.fn(),
    submitPredictions: jest.fn(),
    finish: jest.fn(),
    getWalletBalance: jest.fn().mockResolvedValue(100),
    deductBalance: jest.fn().mockResolvedValue(undefined),
    creditBalance: jest.fn(),
  } as any;
}

describe('JoinPredictionRoomUseCase', () => {
  it('joins a WAITING room, deducts balance', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new JoinPredictionRoomUseCase(repo);

    await useCase.execute('room-1', 'user-2');

    expect(repo.deductBalance).toHaveBeenCalledWith('user-2', 20);
    expect(repo.addPlayer).toHaveBeenCalledWith('room-1', 'user-2');
  });

  it('throws PREDICTION_ROOM_NOT_FOUND when room does not exist', async () => {
    const repo = makeRepo(null);
    const useCase = new JoinPredictionRoomUseCase(repo);
    await expect(useCase.execute('missing', 'user-2')).rejects.toThrow('PREDICTION_ROOM_NOT_FOUND');
  });

  it('throws PREDICTION_ROOM_NOT_WAITING when room is IN_PROGRESS', async () => {
    const room = makeRoom({ status: 'IN_PROGRESS' });
    const repo = makeRepo(room);
    const useCase = new JoinPredictionRoomUseCase(repo);
    await expect(useCase.execute('room-1', 'user-2')).rejects.toThrow('PREDICTION_ROOM_NOT_WAITING');
  });

  it('throws PREDICTION_ROOM_FULL when at max capacity', async () => {
    const players = Array.from({ length: 4 }, (_, i) => ({
      id: `p${i}`, roomId: 'room-1', userId: `u${i}`, isBot: false, displayName: null,
      status: 'WAITING' as const, score: 0, position: null, joinedAt: new Date(), predictions: [],
    }));
    const room = makeRoom({ players });
    const repo = makeRepo(room);
    const useCase = new JoinPredictionRoomUseCase(repo);
    await expect(useCase.execute('room-1', 'user-new')).rejects.toThrow('PREDICTION_ROOM_FULL');
  });

  it('throws PREDICTION_ROOM_ALREADY_JOINED when user is already a player', async () => {
    const players = [{
      id: 'p1', roomId: 'room-1', userId: 'user-2', isBot: false, displayName: null,
      status: 'WAITING' as const, score: 0, position: null, joinedAt: new Date(), predictions: [],
    }];
    const room = makeRoom({ players });
    const repo = makeRepo(room);
    const useCase = new JoinPredictionRoomUseCase(repo);
    await expect(useCase.execute('room-1', 'user-2')).rejects.toThrow('PREDICTION_ROOM_ALREADY_JOINED');
  });

  it('skips balance deduction in simulation mode', async () => {
    const room = makeRoom({ isSimulation: true });
    const repo = makeRepo(room);
    const useCase = new JoinPredictionRoomUseCase(repo);

    await useCase.execute('room-1', 'user-2');

    expect(repo.getWalletBalance).not.toHaveBeenCalled();
    expect(repo.deductBalance).not.toHaveBeenCalled();
  });

  it('throws INSUFFICIENT_BALANCE when balance < entryAmount', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    (repo.getWalletBalance as jest.Mock).mockResolvedValue(5);
    const useCase = new JoinPredictionRoomUseCase(repo);
    await expect(useCase.execute('room-1', 'user-2')).rejects.toThrow('INSUFFICIENT_BALANCE');
  });
});
