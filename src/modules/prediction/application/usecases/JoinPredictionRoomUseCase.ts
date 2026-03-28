import { IPredictionRoomRepository, PredictionRoomData } from '../../domain/repositories/IPredictionRoomRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class JoinPredictionRoomUseCase {
  constructor(private readonly repo: IPredictionRoomRepository) {}

  async execute(roomId: string, userId: string): Promise<PredictionRoomData> {
    const room = await this.repo.findById(roomId);
    if (!room) throw new AppError('PREDICTION_ROOM_NOT_FOUND');

    if (room.status !== 'WAITING') throw new AppError('PREDICTION_ROOM_NOT_WAITING');

    if (room.players.length >= room.maxPlayers) throw new AppError('PREDICTION_ROOM_FULL');

    const alreadyJoined = room.players.some((p) => p.userId === userId);
    if (alreadyJoined) throw new AppError('PREDICTION_ROOM_ALREADY_JOINED');

    if (!room.isSimulation) {
      const balance = await this.repo.getWalletBalance(userId);
      if (balance < room.entryAmount) throw new AppError('INSUFFICIENT_BALANCE');
      await this.repo.deductBalance(userId, room.entryAmount);
    }

    return this.repo.addPlayer(roomId, userId);
  }
}
