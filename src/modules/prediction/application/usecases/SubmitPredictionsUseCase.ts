import { IPredictionRoomRepository, PredictionRoomPlayerData } from '../../domain/repositories/IPredictionRoomRepository';
import { SubmitPredictionsDTO } from '../dtos/SubmitPredictionsDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class SubmitPredictionsUseCase {
  constructor(private readonly repo: IPredictionRoomRepository) {}

  async execute(roomId: string, userId: string, dto: SubmitPredictionsDTO): Promise<PredictionRoomPlayerData> {
    const room = await this.repo.findById(roomId);
    if (!room) throw new AppError('PREDICTION_ROOM_NOT_FOUND');
    if (room.status !== 'IN_PROGRESS') throw new AppError('PREDICTION_ROOM_NOT_IN_PROGRESS');

    // Check deadline
    if (room.predictionsDeadline && new Date() > room.predictionsDeadline) {
      throw new AppError('PREDICTION_DEADLINE_PASSED');
    }

    const player = room.players.find((p) => p.userId === userId);
    if (!player) throw new AppError('PREDICTION_ROOM_NOT_JOINED');

    // Validate that all eventIds belong to this room
    const roomEventIds = new Set(room.events.map((e) => e.id));
    for (const pred of dto.predictions) {
      if (!roomEventIds.has(pred.eventId)) throw new AppError('PREDICTION_INVALID_EVENT');
      const event = room.events.find((e) => e.id === pred.eventId)!;
      const validOption = event.options.some((o) => o.id === pred.optionId);
      if (!validOption) throw new AppError('PREDICTION_INVALID_OPTION');
    }

    return this.repo.submitPredictions({ playerId: player.id, predictions: dto.predictions });
  }
}
