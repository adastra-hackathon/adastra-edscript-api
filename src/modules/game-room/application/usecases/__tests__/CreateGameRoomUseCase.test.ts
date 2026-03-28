import { CreateGameRoomUseCase } from '../CreateGameRoomUseCase';
import type { IGameRoomRepository, GameRoomData } from '../../../domain/repositories/IGameRoomRepository';
import type { CreateGameRoomDTO } from '../../dtos/CreateGameRoomDTO';

function makeRoom(overrides: Partial<GameRoomData> = {}): GameRoomData {
  return {
    id: 'room-1',
    hostId: 'user-1',
    gameId: 'game-1',
    entryAmount: 20,
    maxPlayers: 10,
    status: 'WAITING',
    startAt: null,
    duration: 300,
    prizePool: 0,
    platformFee: 0,
    winnerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    players: [],
    ...overrides,
  };
}

function makeRepo(room: GameRoomData): IGameRoomRepository {
  return {
    create: jest.fn().mockResolvedValue(room),
    findById: jest.fn().mockResolvedValue(room),
    findAll: jest.fn().mockResolvedValue([room]),
    addPlayer: jest.fn().mockResolvedValue(room),
    start: jest.fn().mockResolvedValue(room),
    finish: jest.fn().mockResolvedValue(room),
    getWalletBalance: jest.fn().mockResolvedValue(100),
    deductBalance: jest.fn().mockResolvedValue(undefined),
    creditBalance: jest.fn().mockResolvedValue(undefined),
    createVoucher: jest.fn().mockResolvedValue({}),
  };
}

const baseDTO: CreateGameRoomDTO = {
  gameId: 'game-1',
  entryAmount: 20,
  maxPlayers: 10,
  duration: 300,
};

describe('CreateGameRoomUseCase', () => {
  it('creates a room and returns the created data', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new CreateGameRoomUseCase(repo);

    const result = await useCase.execute('user-1', baseDTO);

    expect(result).toEqual(room);
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it('passes hostId and gameId to the repository', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new CreateGameRoomUseCase(repo);

    await useCase.execute('user-host', baseDTO);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ hostId: 'user-host', gameId: 'game-1' }),
    );
  });

  it('converts startAt string to Date when provided', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new CreateGameRoomUseCase(repo);
    const startAt = '2026-04-01T10:00:00.000Z';

    await useCase.execute('user-1', { ...baseDTO, startAt });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ startAt: new Date(startAt) }),
    );
  });
});
