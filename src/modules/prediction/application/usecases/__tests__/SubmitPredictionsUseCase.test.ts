import { SubmitPredictionsUseCase } from '../SubmitPredictionsUseCase';
import type { IPredictionRoomRepository, PredictionRoomData, PredictionRoomPlayerData } from '../../../domain/repositories/IPredictionRoomRepository';

function makeOption(id: string, eventId: string) {
  return { id, eventId, label: `Opt ${id}`, sortOrder: 0 };
}

function makeEvent(id: string, roomId: string) {
  return {
    id, roomId, title: 'Event', description: null, sortOrder: 0,
    correctOptionId: null, createdAt: new Date(),
    options: [makeOption(`${id}-opt1`, id), makeOption(`${id}-opt2`, id)],
  };
}

function makePlayer(overrides = {}): PredictionRoomPlayerData {
  return {
    id: 'p1', roomId: 'room-1', userId: 'user-1', isBot: false, displayName: null,
    status: 'WAITING', score: 0, position: null, joinedAt: new Date(), predictions: [],
    ...overrides,
  };
}

function makeRoom(overrides: Partial<PredictionRoomData> = {}): PredictionRoomData {
  const event = makeEvent('event-1', 'room-1');
  return {
    id: 'room-1', hostId: 'host-1', title: 'Test', entryAmount: 20, maxPlayers: 10,
    status: 'IN_PROGRESS', predictionsDeadline: null, prizePool: 40, platformFee: 2,
    winnerId: null, isSimulation: false, createdAt: new Date(), updatedAt: new Date(),
    events: [event],
    players: [makePlayer()],
    ...overrides,
  };
}

function makeRepo(room: PredictionRoomData | null, player = makePlayer()): IPredictionRoomRepository {
  return {
    create: jest.fn(),
    findById: jest.fn().mockResolvedValue(room),
    findAll: jest.fn(),
    addPlayer: jest.fn(),
    start: jest.fn(),
    submitPredictions: jest.fn().mockResolvedValue(player),
    finish: jest.fn(),
    getWalletBalance: jest.fn(),
    deductBalance: jest.fn(),
    creditBalance: jest.fn(),
  } as any;
}

describe('SubmitPredictionsUseCase', () => {
  it('submits valid predictions', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new SubmitPredictionsUseCase(repo);

    const dto = { predictions: [{ eventId: 'event-1', optionId: 'event-1-opt1' }] };
    const result = await useCase.execute('room-1', 'user-1', dto);

    expect(repo.submitPredictions).toHaveBeenCalledWith(
      expect.objectContaining({ playerId: 'p1' }),
    );
    expect(result).toBeDefined();
  });

  it('throws PREDICTION_ROOM_NOT_FOUND when room does not exist', async () => {
    const repo = makeRepo(null);
    const useCase = new SubmitPredictionsUseCase(repo);
    await expect(useCase.execute('missing', 'user-1', { predictions: [] })).rejects.toThrow('PREDICTION_ROOM_NOT_FOUND');
  });

  it('throws PREDICTION_ROOM_NOT_IN_PROGRESS when room is WAITING', async () => {
    const room = makeRoom({ status: 'WAITING' });
    const repo = makeRepo(room);
    const useCase = new SubmitPredictionsUseCase(repo);
    await expect(useCase.execute('room-1', 'user-1', { predictions: [{ eventId: 'event-1', optionId: 'event-1-opt1' }] })).rejects.toThrow('PREDICTION_ROOM_NOT_IN_PROGRESS');
  });

  it('throws PREDICTION_DEADLINE_PASSED when deadline has passed', async () => {
    const room = makeRoom({ predictionsDeadline: new Date(Date.now() - 1000) });
    const repo = makeRepo(room);
    const useCase = new SubmitPredictionsUseCase(repo);
    await expect(
      useCase.execute('room-1', 'user-1', { predictions: [{ eventId: 'event-1', optionId: 'event-1-opt1' }] }),
    ).rejects.toThrow('PREDICTION_DEADLINE_PASSED');
  });

  it('throws PREDICTION_ROOM_NOT_JOINED when user is not a player', async () => {
    const room = makeRoom({ players: [] });
    const repo = makeRepo(room);
    const useCase = new SubmitPredictionsUseCase(repo);
    await expect(
      useCase.execute('room-1', 'unknown-user', { predictions: [{ eventId: 'event-1', optionId: 'event-1-opt1' }] }),
    ).rejects.toThrow('PREDICTION_ROOM_NOT_JOINED');
  });

  it('throws PREDICTION_INVALID_EVENT for event from a different room', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new SubmitPredictionsUseCase(repo);
    await expect(
      useCase.execute('room-1', 'user-1', { predictions: [{ eventId: 'foreign-event', optionId: 'any-opt' }] }),
    ).rejects.toThrow('PREDICTION_INVALID_EVENT');
  });

  it('throws PREDICTION_INVALID_OPTION for option not in event', async () => {
    const room = makeRoom();
    const repo = makeRepo(room);
    const useCase = new SubmitPredictionsUseCase(repo);
    await expect(
      useCase.execute('room-1', 'user-1', { predictions: [{ eventId: 'event-1', optionId: 'not-a-real-option' }] }),
    ).rejects.toThrow('PREDICTION_INVALID_OPTION');
  });
});
