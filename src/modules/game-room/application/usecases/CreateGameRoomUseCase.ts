import { IGameRoomRepository, GameRoomData } from '../../domain/repositories/IGameRoomRepository';
import { CreateGameRoomDTO } from '../dtos/CreateGameRoomDTO';

export class CreateGameRoomUseCase {
  constructor(private readonly repo: IGameRoomRepository) {}

  async execute(hostId: string, dto: CreateGameRoomDTO): Promise<GameRoomData> {
    const room = await this.repo.create({
      hostId,
      gameId: dto.gameId,
      entryAmount: dto.entryAmount,
      maxPlayers: dto.maxPlayers,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      duration: dto.duration,
      isSimulation: dto.isSimulation,
    });

    // Auto-join host as first player
    if (dto.isSimulation) {
      // Simulation: use a fake initial balance, no deduction
      return this.repo.addPlayer(room.id, hostId, dto.entryAmount * 10);
    } else {
      const balance = await this.repo.getWalletBalance(hostId);
      await this.repo.deductBalance(hostId, dto.entryAmount);
      return this.repo.addPlayer(room.id, hostId, balance - dto.entryAmount);
    }
  }
}
