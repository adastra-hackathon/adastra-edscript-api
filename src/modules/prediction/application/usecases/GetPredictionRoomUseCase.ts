import { IPredictionRoomRepository, PredictionRoomData } from '../../domain/repositories/IPredictionRoomRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class GetPredictionRoomUseCase {
  constructor(private readonly repo: IPredictionRoomRepository) {}

  async execute(id: string): Promise<PredictionRoomData> {
    const room = await this.repo.findById(id);
    if (!room) throw new AppError('PREDICTION_ROOM_NOT_FOUND');
    return room;
  }
}
