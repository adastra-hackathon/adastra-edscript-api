import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../../shared/middlewares/authenticate';
import { CreateBetslipSchema } from '../../application/dtos/CreateBetslipDTO';
import { UpdateBetslipSchema } from '../../application/dtos/UpdateBetslipDTO';
import { AppError } from '../../../../shared/errors/AppError';
import { CreateBetslipUseCase } from '../../application/usecases/CreateBetslipUseCase';
import { GetBetslipUseCase } from '../../application/usecases/GetBetslipUseCase';
import { ListBetslipsUseCase } from '../../application/usecases/ListBetslipsUseCase';
import { SubmitBetslipUseCase } from '../../application/usecases/SubmitBetslipUseCase';
import { RemoveSelectionUseCase } from '../../application/usecases/RemoveSelectionUseCase';
import { ClearBetslipUseCase } from '../../application/usecases/ClearBetslipUseCase';
import { UpdateBetslipUseCase } from '../../application/usecases/UpdateBetslipUseCase';
import { PrismaBetslipRepository } from '../../infra/repositories/PrismaBetslipRepository';

export class BetslipController {
  private repo() {
    return new PrismaBetslipRepository();
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = CreateBetslipSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const result = await new CreateBetslipUseCase(this.repo()).execute(req.userId, parsed.data);
    res.status(201).json({ success: true, data: result });
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await new ListBetslipsUseCase(this.repo()).execute(req.userId);
    res.json({ success: true, data: result });
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await new GetBetslipUseCase(this.repo()).execute(req.params.id, req.userId);
    res.json({ success: true, data: result });
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = UpdateBetslipSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR');
    const result = await new UpdateBetslipUseCase(this.repo()).execute(req.params.id, req.userId, parsed.data);
    res.json({ success: true, data: result });
  }

  async submit(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await new SubmitBetslipUseCase(this.repo()).execute(req.params.id, req.userId);
    res.json({ success: true, data: result });
  }

  async removeSelection(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await new RemoveSelectionUseCase(this.repo()).execute(
      req.params.id,
      req.params.selectionId,
      req.userId,
    );
    res.json({ success: true, data: result });
  }

  async clear(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await new ClearBetslipUseCase(this.repo()).execute(req.params.id, req.userId);
    res.json({ success: true, data: result });
  }
}
