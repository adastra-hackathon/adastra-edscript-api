import { AppError } from '../../../../shared/errors/AppError';
import type { IBetslipRepository, BetSlipData } from '../../domain/repositories/IBetslipRepository';

export class RemoveSelectionUseCase {
  constructor(private readonly repo: IBetslipRepository) {}

  async execute(betSlipId: string, selectionId: string, userId: string): Promise<BetSlipData> {
    const betslip = await this.repo.findById(betSlipId, userId);
    if (!betslip) throw new AppError('BETSLIP_NOT_FOUND');
    const exists = betslip.selections.some((s) => s.id === selectionId);
    if (!exists) throw new AppError('SELECTION_NOT_FOUND');
    return this.repo.removeSelection(betSlipId, selectionId, userId);
  }
}
