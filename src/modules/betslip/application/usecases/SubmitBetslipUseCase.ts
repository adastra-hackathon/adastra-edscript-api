import { AppError } from '../../../../shared/errors/AppError';
import type { IBetslipRepository, BetSlipData } from '../../domain/repositories/IBetslipRepository';

export class SubmitBetslipUseCase {
  constructor(private readonly repo: IBetslipRepository) {}

  async execute(id: string, userId: string): Promise<BetSlipData> {
    const betslip = await this.repo.findById(id, userId);
    if (!betslip) throw new AppError('BETSLIP_NOT_FOUND');
    if (betslip.status !== 'DRAFT') throw new AppError('BETSLIP_ALREADY_SUBMITTED');
    if (betslip.selections.length === 0) throw new AppError('BETSLIP_EMPTY');
    return this.repo.submit(id, userId);
  }
}
