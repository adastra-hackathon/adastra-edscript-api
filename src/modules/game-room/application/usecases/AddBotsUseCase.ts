import { IGameRoomRepository, GameRoomData } from '../../domain/repositories/IGameRoomRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class AddBotsUseCase {
  constructor(private readonly repo: IGameRoomRepository) {}

  async execute(roomId: string, userId: string, count: number): Promise<GameRoomData> {
    const room = await this.repo.findById(roomId);
    if (!room) throw new AppError('GAME_ROOM_NOT_FOUND');
    if (room.hostId !== userId) throw new AppError('GAME_ROOM_FORBIDDEN');
    if (room.status !== 'WAITING') throw new AppError('GAME_ROOM_NOT_WAITING');
    if (!room.isSimulation) throw new AppError('GAME_ROOM_FORBIDDEN');

    const safeCount = Math.min(count, room.maxPlayers - room.players.length);
    if (safeCount <= 0) throw new AppError('GAME_ROOM_FULL');

    return this.repo.addBots({
      roomId,
      count: safeCount,
      initialBalance: room.entryAmount * 10,
    });
  }
}
