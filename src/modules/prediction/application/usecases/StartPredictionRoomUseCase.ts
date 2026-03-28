import { IPredictionRoomRepository, PredictionRoomData } from '../../domain/repositories/IPredictionRoomRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class StartPredictionRoomUseCase {
  constructor(private readonly repo: IPredictionRoomRepository) {}

  async execute(roomId: string, userId: string): Promise<PredictionRoomData> {
    const room = await this.repo.findById(roomId);
    if (!room) throw new AppError('PREDICTION_ROOM_NOT_FOUND');
    if (room.hostId !== userId) throw new AppError('PREDICTION_ROOM_FORBIDDEN');
    if (room.status !== 'WAITING') throw new AppError('PREDICTION_ROOM_NOT_WAITING');
    if (room.players.length < 2) throw new AppError('PREDICTION_ROOM_NOT_ENOUGH_PLAYERS');
    return this.repo.start(roomId);
  }
}
