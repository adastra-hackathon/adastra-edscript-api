import { AppError } from '../../../../shared/errors/AppError';
import type { IBetslipRepository, BetSlipData } from '../../domain/repositories/IBetslipRepository';

export class ClearBetslipUseCase {
  constructor(private readonly repo: IBetslipRepository) {}

  async execute(id: string, userId: string): Promise<BetSlipData> {
    const betslip = await this.repo.findById(id, userId);
    if (!betslip) throw new AppError('BETSLIP_NOT_FOUND');
    return this.repo.clear(id, userId);
  }
}
