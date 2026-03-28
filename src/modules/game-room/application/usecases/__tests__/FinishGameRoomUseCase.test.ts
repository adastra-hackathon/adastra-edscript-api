import { FinishGameRoomUseCase } from '../FinishGameRoomUseCase';
import type { IGameRoomRepository, GameRoomData } from '../../../domain/repositories/IGameRoomRepository';
import type { FinishGameRoomDTO } from '../../dtos/FinishGameRoomDTO';

function makeRoom(overrides: Partial<GameRoomData> = {}): GameRoomData {
  return {
    id: 'room-1',
    hostId: 'host-1',
    gameId: 'game-1',
    entryAmount: 20,
    maxPlayers: 10,
    status: 'IN_PROGRESS',
    startAt: new Date(),
    duration: 300,
    prizePool: 60,
    platformFee: 0,
    winnerId: null,
    isSimulation: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    players: [
      { id: 'p1', roomId: 'room-1', userId: 'user-1', isBot: false, displayName: null, initialBalance: 100, finalBalance: null, profit: null, position: null, joinedAt: new Date() },
      { id: 'p2', roomId: 'room-1', userId: 'user-2', isBot: false, displayName: null, initialBalance: 100, finalBalance: null, profit: null, position: null, joinedAt: new Date() },
      { id: 'p3', roomId: 'room-1', userId: 'user-3', isBot: false, displayName: null, initialBalance: 100, finalBalance: null, profit: null, position: null, joinedAt: new Date() },
    ],
    ...overrides,
  };
}

function makeRepo(overrides: Partial<IGameRoomRepository> = {}): IGameRoomRepository {
  const room = makeRoom();
  return {
    create: jest.fn().mockResolvedValue(room),
    findById: jest.fn().mockResolvedValue(room),
    findAll: jest.fn().mockResolvedValue([room]),
    addPlayer: jest.fn().mockResolvedValue(room),
    addBots: jest.fn().mockResolvedValue(room),
    start: jest.fn().mockResolvedValue(room),
    finish: jest.fn().mockResolvedValue({ ...room, status: 'FINISHED', winnerId: 'user-1' }),
    getWalletBalance: jest.fn().mockResolvedValue(100),
    deductBalance: jest.fn().mockResolvedValue(undefined),
    creditBalance: jest.fn().mockResolvedValue(undefined),
    createVoucher: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

const baseDTO: FinishGameRoomDTO = {
  results: [
    { userId: 'user-1', finalBalance: 130, position: 1 },
    { userId: 'user-2', finalBalance: 100, position: 2 },
    { userId: 'user-3', finalBalance: 80, position: 3 },
  ],
  winnerId: 'user-1',
  lastPlaceUserId: 'user-3',
};

describe('FinishGameRoomUseCase', () => {
  it('finishes the room and returns updated data', async () => {
    const repo = makeRepo();
    const useCase = new FinishGameRoomUseCase(repo);

    const result = await useCase.execute('room-1', 'host-1', baseDTO);

    expect(result.status).toBe('FINISHED');
    expect(result.winnerId).toBe('user-1');
  });

  it('calls repo.finish with correct input', async () => {
    const repo = makeRepo();
    const useCase = new FinishGameRoomUseCase(repo);

    await useCase.execute('room-1', 'host-1', baseDTO);

    expect(repo.finish).toHaveBeenCalledWith(
      expect.objectContaining({
        roomId: 'room-1',
        winnerId: 'user-1',
        lastPlaceUserId: 'user-3',
        entryAmount: 20,
      }),
    );
  });

  it('throws GAME_ROOM_NOT_FOUND when room does not exist', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const useCase = new FinishGameRoomUseCase(repo);

    await expect(useCase.execute('room-x', 'host-1', baseDTO)).rejects.toMatchObject({ code: 'GAME_ROOM_NOT_FOUND' });
  });

  it('throws GAME_ROOM_FORBIDDEN when non-host tries to finish', async () => {
    const repo = makeRepo();
    const useCase = new FinishGameRoomUseCase(repo);

    await expect(useCase.execute('room-1', 'other-user', baseDTO)).rejects.toMatchObject({ code: 'GAME_ROOM_FORBIDDEN' });
  });

  it('throws GAME_ROOM_NOT_IN_PROGRESS when room is not in progress', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(makeRoom({ status: 'WAITING' })) });
    const useCase = new FinishGameRoomUseCase(repo);

    await expect(useCase.execute('room-1', 'host-1', baseDTO)).rejects.toMatchObject({ code: 'GAME_ROOM_NOT_IN_PROGRESS' });
  });
});
