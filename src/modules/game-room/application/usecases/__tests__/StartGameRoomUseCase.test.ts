import { StartGameRoomUseCase } from '../StartGameRoomUseCase';
import type { IGameRoomRepository, GameRoomData } from '../../../domain/repositories/IGameRoomRepository';

function makeRoom(overrides: Partial<GameRoomData> = {}): GameRoomData {
  return {
    id: 'room-1',
    hostId: 'host-1',
    gameId: 'game-1',
    entryAmount: 20,
    maxPlayers: 10,
    status: 'WAITING',
    startAt: null,
    duration: 300,
    prizePool: 40,
    platformFee: 0,
    winnerId: null,
    isSimulation: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    players: [],
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
    start: jest.fn().mockResolvedValue({ ...room, status: 'IN_PROGRESS' }),
    finish: jest.fn().mockResolvedValue(room),
    getWalletBalance: jest.fn().mockResolvedValue(100),
    deductBalance: jest.fn().mockResolvedValue(undefined),
    creditBalance: jest.fn().mockResolvedValue(undefined),
    createVoucher: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe('StartGameRoomUseCase', () => {
  it('starts the room when host requests it', async () => {
    const repo = makeRepo();
    const useCase = new StartGameRoomUseCase(repo);

    const result = await useCase.execute('room-1', 'host-1');

    expect(result.status).toBe('IN_PROGRESS');
    expect(repo.start).toHaveBeenCalledWith('room-1', expect.any(Date));
  });

  it('throws GAME_ROOM_NOT_FOUND when room does not exist', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const useCase = new StartGameRoomUseCase(repo);

    await expect(useCase.execute('room-x', 'host-1')).rejects.toMatchObject({ code: 'GAME_ROOM_NOT_FOUND' });
  });

  it('throws GAME_ROOM_FORBIDDEN when non-host tries to start', async () => {
    const repo = makeRepo();
    const useCase = new StartGameRoomUseCase(repo);

    await expect(useCase.execute('room-1', 'other-user')).rejects.toMatchObject({ code: 'GAME_ROOM_FORBIDDEN' });
  });

  it('throws GAME_ROOM_NOT_WAITING when room is already in progress', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(makeRoom({ status: 'IN_PROGRESS' })) });
    const useCase = new StartGameRoomUseCase(repo);

    await expect(useCase.execute('room-1', 'host-1')).rejects.toMatchObject({ code: 'GAME_ROOM_NOT_WAITING' });
  });
});
