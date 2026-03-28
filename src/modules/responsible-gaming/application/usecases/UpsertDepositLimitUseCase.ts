import type { IResponsibleGamingRepository } from '../../domain/repositories/IResponsibleGamingRepository';
import type { DepositLimitDTO } from '../dtos/DepositLimitDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class UpsertDepositLimitUseCase {
  constructor(private readonly repo: IResponsibleGamingRepository) {}

  async execute(userId: string, dto: DepositLimitDTO) {
    const existing = await this.repo.getLimitByType(userId, 'DEPOSIT_AMOUNT');

    if (existing) {
      const wouldIncrease =
        (dto.dailyAmount && existing.dailyLimit && dto.dailyAmount > existing.dailyLimit) ||
        (dto.weeklyAmount && existing.weeklyLimit && dto.weeklyAmount > existing.weeklyLimit) ||
        (dto.monthlyAmount && existing.monthlyLimit && dto.monthlyAmount > existing.monthlyLimit);

      if (wouldIncrease) {
        throw new AppError('RESPONSIBLE_GAMING_LIMIT_INCREASE_NOT_ALLOWED');
      }
    }

    return this.repo.upsertLimit({
      userId,
      type: 'DEPOSIT_AMOUNT',
      dailyLimit: dto.dailyAmount ?? null,
      weeklyLimit: dto.weeklyAmount ?? null,
      monthlyLimit: dto.monthlyAmount ?? null,
      reason: dto.reason ?? null,
    });
  }
}
