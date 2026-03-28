import { IPredictionRoomRepository, PredictionRoomData, PredictionRoomStatus } from '../../domain/repositories/IPredictionRoomRepository';

export class ListPredictionRoomsUseCase {
  constructor(private readonly repo: IPredictionRoomRepository) {}

  async execute(status?: PredictionRoomStatus): Promise<PredictionRoomData[]> {
    return this.repo.findAll(status);
  }
}
