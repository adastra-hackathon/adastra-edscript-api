import { IPredictionRoomRepository, PredictionRoomData } from '../../domain/repositories/IPredictionRoomRepository';
import { FinishPredictionRoomDTO } from '../dtos/FinishPredictionRoomDTO';
import { AppError } from '../../../../shared/errors/AppError';

const PLATFORM_FEE_RATE = 0.05;

export class FinishPredictionRoomUseCase {
  constructor(private readonly repo: IPredictionRoomRepository) {}

  async execute(roomId: string, userId: string, dto: FinishPredictionRoomDTO): Promise<PredictionRoomData> {
    const room = await this.repo.findById(roomId);
    if (!room) throw new AppError('PREDICTION_ROOM_NOT_FOUND');
    if (room.hostId !== userId) throw new AppError('PREDICTION_ROOM_FORBIDDEN');
    if (room.status !== 'IN_PROGRESS') throw new AppError('PREDICTION_ROOM_NOT_IN_PROGRESS');

    // Validate all provided eventIds belong to the room
    const roomEventIds = new Set(room.events.map((e) => e.id));
    for (const co of dto.correctOptions) {
      if (!roomEventIds.has(co.eventId)) throw new AppError('PREDICTION_INVALID_EVENT');
    }

    return this.repo.finish({
      roomId,
      correctOptions: dto.correctOptions,
      entryAmount: room.entryAmount,
      isSimulation: room.isSimulation,
    });
  }
}
