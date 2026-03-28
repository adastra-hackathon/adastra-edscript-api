import { IGameRoomRepository, GameRoomData } from '../../domain/repositories/IGameRoomRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class StartGameRoomUseCase {
  constructor(private readonly repo: IGameRoomRepository) {}

  async execute(roomId: string, userId: string): Promise<GameRoomData> {
    const room = await this.repo.findById(roomId);
    if (!room) throw new AppError('GAME_ROOM_NOT_FOUND');

    if (room.hostId !== userId) throw new AppError('GAME_ROOM_FORBIDDEN');

    if (room.status !== 'WAITING') throw new AppError('GAME_ROOM_NOT_WAITING');

    return this.repo.start(roomId, new Date());
  }
}
