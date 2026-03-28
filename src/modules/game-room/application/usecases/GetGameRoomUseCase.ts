import { IGameRoomRepository, GameRoomData } from '../../domain/repositories/IGameRoomRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class GetGameRoomUseCase {
  constructor(private readonly repo: IGameRoomRepository) {}

  async execute(id: string): Promise<GameRoomData> {
    const room = await this.repo.findById(id);
    if (!room) throw new AppError('GAME_ROOM_NOT_FOUND');
    return room;
  }
}
