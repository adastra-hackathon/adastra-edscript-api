import { AppError } from '../../../../shared/errors/AppError';
import type { IBetslipRepository, BetSlipData } from '../../domain/repositories/IBetslipRepository';
import type { UpdateBetslipDTO } from '../dtos/UpdateBetslipDTO';

export class UpdateBetslipUseCase {
  constructor(private readonly repo: IBetslipRepository) {}

  async execute(id: string, userId: string, dto: UpdateBetslipDTO): Promise<BetSlipData> {
    const betslip = await this.repo.findById(id, userId);
    if (!betslip) throw new AppError('BETSLIP_NOT_FOUND');
    return this.repo.update(id, userId, dto);
  }
}
