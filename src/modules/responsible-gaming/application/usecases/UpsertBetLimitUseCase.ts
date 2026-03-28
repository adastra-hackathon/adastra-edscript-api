import type { IResponsibleGamingRepository } from '../../domain/repositories/IResponsibleGamingRepository';
import type { BetLimitDTO } from '../dtos/BetLimitDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class UpsertBetLimitUseCase {
  constructor(private readonly repo: IResponsibleGamingRepository) {}

  async execute(userId: string, dto: BetLimitDTO) {
    const existing = await this.repo.getLimitByType(userId, 'BET_AMOUNT');

    // Business rule: cannot increase an active limit
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
      type: 'BET_AMOUNT',
      dailyLimit: dto.dailyAmount ?? null,
      weeklyLimit: dto.weeklyAmount ?? null,
      monthlyLimit: dto.monthlyAmount ?? null,
      reason: dto.reason ?? null,
    });
  }
}
