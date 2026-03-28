import { CreatePredictionRoomUseCase } from '../CreatePredictionRoomUseCase';
import type { IPredictionRoomRepository, PredictionRoomData } from '../../../domain/repositories/IPredictionRoomRepository';
import type { CreatePredictionRoomDTO } from '../../dtos/CreatePredictionRoomDTO';

function makeRoom(overrides: Partial<PredictionRoomData> = {}): PredictionRoomData {
  return {
    id: 'room-1',
    hostId: 'user-1',
    title: 'Test Room',
    entryAmount: 20,
    maxPlayers: 10,
    status: 'WAITING',
    predictionsDeadline: null,
    prizePool: 20,
    platformFee: 1,
    winnerId: null,
    isSimulation: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    players: [],
    events: [],
    ...overrides,
  };
}

function makeRepo(room: PredictionRoomData): IPredictionRoomRepository {
  return {
    create: jest.fn().mockResolvedValue(room),
    findById: jest.fn().mockResolvedValue(room),
    findAll: jest.fn().mockResolvedValue([room]),
    addPlayer: jest.fn().mockResolvedValue(room),
    start: jest.fn().mockResolvedValue(room),
    submitPredictions: jest.fn().mockResolvedValue({}),
    finish: jest.fn().mockResolvedValue(room),
    getWalletBalance: jest.fn().mockResolvedValue(100),
    deductBalance: jest.fn().mockResolvedValue(undefined),
    creditBalance: jest.fn().mockResolvedValue(undefined),
  };
}

const baseDTO: CreatePredictionRoomDTO = {
  title: 'Champions League Final',
  entryAmount: 20,
  maxPlayers: 10,
  isSimulation: false,
  events: [
    { title: 'Who will score first?', sortOrder: 0, options: [{ label: 'Team A', sortOrder: 0 }, { label: 'Team B', sortOrder: 1 }] },
  ],
};

describe('CreatePredictionRoomUseCase', () => {
  it('creates a room and auto-joins the host', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new CreatePredictionRoomUseCase(repo);

    const result = await useCase.execute('user-1', baseDTO);

    expect(repo.deductBalance).toHaveBeenCalledWith('user-1', 20);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.addPlayer).toHaveBeenCalledWith('room-1', 'user-1');
    expect(result).toEqual(room);
  });

  it('throws INSUFFICIENT_BALANCE when balance is too low', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    (repo.getWalletBalance as jest.Mock).mockResolvedValue(5);
    const useCase = new CreatePredictionRoomUseCase(repo);

    await expect(useCase.execute('user-1', baseDTO)).rejects.toThrow('INSUFFICIENT_BALANCE');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('skips balance check in simulation mode', async () => {
    const room = makeRoom({ isSimulation: true });
    const repo = makeRepo(room);
    const useCase = new CreatePredictionRoomUseCase(repo);

    await useCase.execute('user-1', { ...baseDTO, isSimulation: true });

    expect(repo.getWalletBalance).not.toHaveBeenCalled();
    expect(repo.deductBalance).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it('passes title and events to the repository', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new CreatePredictionRoomUseCase(repo);

    await useCase.execute('user-1', baseDTO);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Champions League Final', events: baseDTO.events }),
    );
  });
});
