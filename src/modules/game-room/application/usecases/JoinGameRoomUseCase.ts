import { IGameRoomRepository, GameRoomData } from '../../domain/repositories/IGameRoomRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class JoinGameRoomUseCase {
  constructor(private readonly repo: IGameRoomRepository) {}

  async execute(roomId: string, userId: string): Promise<GameRoomData> {
    const room = await this.repo.findById(roomId);
    if (!room) throw new AppError('GAME_ROOM_NOT_FOUND');

    if (room.status !== 'WAITING') throw new AppError('GAME_ROOM_NOT_WAITING');

    if (room.players.length >= room.maxPlayers) throw new AppError('GAME_ROOM_FULL');

    const alreadyJoined = room.players.some((p) => p.userId === userId);
    if (alreadyJoined) throw new AppError('GAME_ROOM_ALREADY_JOINED');

    if (room.isSimulation) {
      // Simulation mode: skip balance check, use fake initial balance
      return this.repo.addPlayer(roomId, userId, room.entryAmount * 10);
    }

    const balance = await this.repo.getWalletBalance(userId);
    if (balance < room.entryAmount) throw new AppError('INSUFFICIENT_BALANCE');

    await this.repo.deductBalance(userId, room.entryAmount);
    return this.repo.addPlayer(roomId, userId, balance - room.entryAmount);
  }
}
