import { JoinGameRoomUseCase } from '../JoinGameRoomUseCase';
import type { IGameRoomRepository, GameRoomData } from '../../../domain/repositories/IGameRoomRepository';
import { AppError } from '../../../../../shared/errors/AppError';

function makeRoom(overrides: Partial<GameRoomData> = {}): GameRoomData {
  return {
    id: 'room-1',
    hostId: 'host-1',
    gameId: 'game-1',
    entryAmount: 20,
    maxPlayers: 2,
    status: 'WAITING',
    startAt: null,
    duration: 300,
    prizePool: 0,
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
    start: jest.fn().mockResolvedValue(room),
    finish: jest.fn().mockResolvedValue(room),
    getWalletBalance: jest.fn().mockResolvedValue(100),
    deductBalance: jest.fn().mockResolvedValue(undefined),
    creditBalance: jest.fn().mockResolvedValue(undefined),
    createVoucher: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe('JoinGameRoomUseCase', () => {
  it('joins successfully and deducts balance', async () => {
    const repo = makeRepo();
    const useCase = new JoinGameRoomUseCase(repo);

    await useCase.execute('room-1', 'user-1');

    expect(repo.deductBalance).toHaveBeenCalledWith('user-1', 20);
    expect(repo.addPlayer).toHaveBeenCalledWith('room-1', 'user-1', 80);
  });

  it('throws GAME_ROOM_NOT_FOUND when room does not exist', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const useCase = new JoinGameRoomUseCase(repo);

    await expect(useCase.execute('room-x', 'user-1')).rejects.toMatchObject({ code: 'GAME_ROOM_NOT_FOUND' });
  });

  it('throws GAME_ROOM_NOT_WAITING when room is in progress', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(makeRoom({ status: 'IN_PROGRESS' })) });
    const useCase = new JoinGameRoomUseCase(repo);

    await expect(useCase.execute('room-1', 'user-1')).rejects.toMatchObject({ code: 'GAME_ROOM_NOT_WAITING' });
  });

  it('throws GAME_ROOM_FULL when room is at max capacity', async () => {
    const players = [
      { id: 'p1', roomId: 'room-1', userId: 'user-a', isBot: false, displayName: null, initialBalance: 100, finalBalance: null, profit: null, position: null, joinedAt: new Date() },
      { id: 'p2', roomId: 'room-1', userId: 'user-b', isBot: false, displayName: null, initialBalance: 100, finalBalance: null, profit: null, position: null, joinedAt: new Date() },
    ];
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(makeRoom({ maxPlayers: 2, players })) });
    const useCase = new JoinGameRoomUseCase(repo);

    await expect(useCase.execute('room-1', 'user-1')).rejects.toMatchObject({ code: 'GAME_ROOM_FULL' });
  });

  it('throws GAME_ROOM_ALREADY_JOINED when user is already in the room', async () => {
    const players = [
      { id: 'p1', roomId: 'room-1', userId: 'user-1', isBot: false, displayName: null, initialBalance: 100, finalBalance: null, profit: null, position: null, joinedAt: new Date() },
    ];
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(makeRoom({ maxPlayers: 5, players })) });
    const useCase = new JoinGameRoomUseCase(repo);

    await expect(useCase.execute('room-1', 'user-1')).rejects.toMatchObject({ code: 'GAME_ROOM_ALREADY_JOINED' });
  });

  it('throws INSUFFICIENT_BALANCE when wallet balance is less than entry amount', async () => {
    const repo = makeRepo({ getWalletBalance: jest.fn().mockResolvedValue(10) });
    const useCase = new JoinGameRoomUseCase(repo);

    await expect(useCase.execute('room-1', 'user-1')).rejects.toMatchObject({ code: 'INSUFFICIENT_BALANCE' });
  });
});
