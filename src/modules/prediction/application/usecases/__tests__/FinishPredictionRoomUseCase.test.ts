import { FinishPredictionRoomUseCase } from '../FinishPredictionRoomUseCase';
import type { IPredictionRoomRepository, PredictionRoomData } from '../../../domain/repositories/IPredictionRoomRepository';

function makeRoom(overrides: Partial<PredictionRoomData> = {}): PredictionRoomData {
  return {
    id: 'room-1', hostId: 'host-1', title: 'Test', entryAmount: 20, maxPlayers: 10,
    status: 'IN_PROGRESS', predictionsDeadline: null, prizePool: 60, platformFee: 3,
    winnerId: null, isSimulation: false, createdAt: new Date(), updatedAt: new Date(),
    players: [], events: [
      { id: 'event-1', roomId: 'room-1', title: 'E1', description: null, sortOrder: 0, correctOptionId: null, createdAt: new Date(), options: [] },
    ],
    ...overrides,
  };
}

function makeRepo(room: PredictionRoomData | null): IPredictionRoomRepository {
  return {
    create: jest.fn(),
    findById: jest.fn().mockResolvedValue(room),
    findAll: jest.fn(),
    addPlayer: jest.fn(),
    start: jest.fn(),
    submitPredictions: jest.fn(),
    finish: jest.fn().mockResolvedValue(room),
    getWalletBalance: jest.fn(),
    deductBalance: jest.fn(),
    creditBalance: jest.fn(),
  } as any;
}

const correctOptions = [{ eventId: 'event-1', optionId: 'opt-a' }];

describe('FinishPredictionRoomUseCase', () => {
  it('finishes room and calls repo.finish', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new FinishPredictionRoomUseCase(repo);

    await useCase.execute('room-1', 'host-1', { correctOptions });

    expect(repo.finish).toHaveBeenCalledWith(
      expect.objectContaining({ roomId: 'room-1', correctOptions }),
    );
  });

  it('throws PREDICTION_ROOM_NOT_FOUND when room is missing', async () => {
    const repo = makeRepo(null);
    const useCase = new FinishPredictionRoomUseCase(repo);
    await expect(useCase.execute('missing', 'host-1', { correctOptions })).rejects.toThrow('PREDICTION_ROOM_NOT_FOUND');
  });

  it('throws PREDICTION_ROOM_FORBIDDEN when caller is not the host', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new FinishPredictionRoomUseCase(repo);
    await expect(useCase.execute('room-1', 'not-host', { correctOptions })).rejects.toThrow('PREDICTION_ROOM_FORBIDDEN');
  });

  it('throws PREDICTION_ROOM_NOT_IN_PROGRESS when room is already FINISHED', async () => {
    const room = makeRoom({ status: 'FINISHED' });
    const repo = makeRepo(room);
    const useCase = new FinishPredictionRoomUseCase(repo);
    await expect(useCase.execute('room-1', 'host-1', { correctOptions })).rejects.toThrow('PREDICTION_ROOM_NOT_IN_PROGRESS');
  });

  it('throws PREDICTION_INVALID_EVENT for event not in this room', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new FinishPredictionRoomUseCase(repo);
    await expect(
      useCase.execute('room-1', 'host-1', { correctOptions: [{ eventId: 'foreign', optionId: 'opt' }] }),
    ).rejects.toThrow('PREDICTION_INVALID_EVENT');
  });
});
