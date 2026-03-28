import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../../shared/middlewares/authenticate';
import { AppError } from '../../../../shared/errors/AppError';
import { CreateGameRoomSchema } from '../../application/dtos/CreateGameRoomDTO';
import { FinishGameRoomSchema } from '../../application/dtos/FinishGameRoomDTO';
import { CreateGameRoomUseCase } from '../../application/usecases/CreateGameRoomUseCase';
import { ListGameRoomsUseCase } from '../../application/usecases/ListGameRoomsUseCase';
import { GetGameRoomUseCase } from '../../application/usecases/GetGameRoomUseCase';
import { JoinGameRoomUseCase } from '../../application/usecases/JoinGameRoomUseCase';
import { StartGameRoomUseCase } from '../../application/usecases/StartGameRoomUseCase';
import { FinishGameRoomUseCase } from '../../application/usecases/FinishGameRoomUseCase';
import { AddBotsUseCase } from '../../application/usecases/AddBotsUseCase';
import { PrismaGameRoomRepository } from '../../infra/repositories/PrismaGameRoomRepository';
import type { GameRoomStatus } from '../../domain/repositories/IGameRoomRepository';

export class GameRoomController {
  private repo() {
    return new PrismaGameRoomRepository();
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = CreateGameRoomSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const result = await new CreateGameRoomUseCase(this.repo()).execute(req.userId, parsed.data);
    res.status(201).json({ success: true, data: result });
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const status = req.query.status as GameRoomStatus | undefined;
    const result = await new ListGameRoomsUseCase(this.repo()).execute(status);
    res.json({ success: true, data: result });
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await new GetGameRoomUseCase(this.repo()).execute(id);
    res.json({ success: true, data: result });
  }

  async join(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await new JoinGameRoomUseCase(this.repo()).execute(id, req.userId);
    res.json({ success: true, data: result });
  }

  async start(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await new StartGameRoomUseCase(this.repo()).execute(id, req.userId);
    res.json({ success: true, data: result });
  }

  async finish(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const parsed = FinishGameRoomSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const result = await new FinishGameRoomUseCase(this.repo()).execute(id, req.userId, parsed.data);
    res.json({ success: true, data: result });
  }

  async addBots(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const count = Number(req.body.count) || 3;
    const result = await new AddBotsUseCase(this.repo()).execute(id, req.userId, count);
    res.json({ success: true, data: result });
  }
}
