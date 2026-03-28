import { IGameRoomRepository, GameRoomData } from '../../domain/repositories/IGameRoomRepository';
import { AppError } from '../../../../shared/errors/AppError';
import { FinishGameRoomDTO } from '../dtos/FinishGameRoomDTO';

export class FinishGameRoomUseCase {
  constructor(private readonly repo: IGameRoomRepository) {}

  async execute(roomId: string, userId: string, dto: FinishGameRoomDTO): Promise<GameRoomData> {
    const room = await this.repo.findById(roomId);
    if (!room) throw new AppError('GAME_ROOM_NOT_FOUND');

    if (room.hostId !== userId) throw new AppError('GAME_ROOM_FORBIDDEN');

    if (room.status !== 'IN_PROGRESS') throw new AppError('GAME_ROOM_NOT_IN_PROGRESS');

    const winnerPrize = Number((room.prizePool * 0.99).toFixed(2));
    const platformFee = Number((room.prizePool * 0.01).toFixed(2));

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.repo.finish({
      roomId,
      results: dto.results,
      winnerId: dto.winnerId,
      lastPlaceUserId: dto.lastPlaceUserId,
      entryAmount: room.entryAmount,
      isSimulation: room.isSimulation,
    });
  }
}
