import { IPredictionRoomRepository, PredictionRoomData } from '../../domain/repositories/IPredictionRoomRepository';
import { CreatePredictionRoomDTO } from '../dtos/CreatePredictionRoomDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class CreatePredictionRoomUseCase {
  constructor(private readonly repo: IPredictionRoomRepository) {}

  async execute(hostId: string, dto: CreatePredictionRoomDTO): Promise<PredictionRoomData> {
    if (!dto.isSimulation) {
      const balance = await this.repo.getWalletBalance(hostId);
      if (balance < dto.entryAmount) throw new AppError('INSUFFICIENT_BALANCE');
      await this.repo.deductBalance(hostId, dto.entryAmount);
    }

    const room = await this.repo.create({
      hostId,
      title: dto.title,
      entryAmount: dto.entryAmount,
      maxPlayers: dto.maxPlayers,
      predictionsDeadline: dto.predictionsDeadline ? new Date(dto.predictionsDeadline) : undefined,
      isSimulation: dto.isSimulation,
      events: dto.events,
    });

    // Auto-join host as first player (already deducted above)
    return this.repo.addPlayer(room.id, hostId);
  }
}
