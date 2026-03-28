import { IGameRoomRepository, GameRoomData, GameRoomStatus } from '../../domain/repositories/IGameRoomRepository';

export class ListGameRoomsUseCase {
  constructor(private readonly repo: IGameRoomRepository) {}

  async execute(status?: GameRoomStatus): Promise<GameRoomData[]> {
    return this.repo.findAll(status);
  }
}
