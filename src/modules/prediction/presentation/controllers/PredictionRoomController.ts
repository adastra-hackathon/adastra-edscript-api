import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../../shared/middlewares/authenticate';
import { AppError } from '../../../../shared/errors/AppError';
import { CreatePredictionRoomSchema } from '../../application/dtos/CreatePredictionRoomDTO';
import { SubmitPredictionsSchema } from '../../application/dtos/SubmitPredictionsDTO';
import { FinishPredictionRoomSchema } from '../../application/dtos/FinishPredictionRoomDTO';
import { CreatePredictionRoomUseCase } from '../../application/usecases/CreatePredictionRoomUseCase';
import { JoinPredictionRoomUseCase } from '../../application/usecases/JoinPredictionRoomUseCase';
import { ListPredictionRoomsUseCase } from '../../application/usecases/ListPredictionRoomsUseCase';
import { GetPredictionRoomUseCase } from '../../application/usecases/GetPredictionRoomUseCase';
import { StartPredictionRoomUseCase } from '../../application/usecases/StartPredictionRoomUseCase';
import { SubmitPredictionsUseCase } from '../../application/usecases/SubmitPredictionsUseCase';
import { FinishPredictionRoomUseCase } from '../../application/usecases/FinishPredictionRoomUseCase';
import { PrismaPredictionRoomRepository } from '../../infra/repositories/PrismaPredictionRoomRepository';
import type { PredictionRoomStatus } from '../../domain/repositories/IPredictionRoomRepository';

export class PredictionRoomController {
  private repo() {
    return new PrismaPredictionRoomRepository();
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = CreatePredictionRoomSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const result = await new CreatePredictionRoomUseCase(this.repo()).execute(req.userId, parsed.data);
    res.status(201).json({ success: true, data: result });
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const status = req.query.status as PredictionRoomStatus | undefined;
    const result = await new ListPredictionRoomsUseCase(this.repo()).execute(status);
    res.json({ success: true, data: result });
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await new GetPredictionRoomUseCase(this.repo()).execute(id);
    res.json({ success: true, data: result });
  }

  async join(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await new JoinPredictionRoomUseCase(this.repo()).execute(id, req.userId);
    res.json({ success: true, data: result });
  }

  async start(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await new StartPredictionRoomUseCase(this.repo()).execute(id, req.userId);
    res.json({ success: true, data: result });
  }

  async submitPredictions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const parsed = SubmitPredictionsSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const result = await new SubmitPredictionsUseCase(this.repo()).execute(id, req.userId, parsed.data);
    res.json({ success: true, data: result });
  }

  async finish(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const parsed = FinishPredictionRoomSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const result = await new FinishPredictionRoomUseCase(this.repo()).execute(id, req.userId, parsed.data);
    res.json({ success: true, data: result });
  }
}
