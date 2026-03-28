import type { IResponsibleGamingRepository } from '../../domain/repositories/IResponsibleGamingRepository';
import type { SessionTimeLimitDTO } from '../dtos/SessionTimeLimitDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class UpsertSessionTimeLimitUseCase {
  constructor(private readonly repo: IResponsibleGamingRepository) {}

  async execute(userId: string, dto: SessionTimeLimitDTO) {
    const existing = await this.repo.getLimitByType(userId, 'TIME_ON_SITE');

    if (existing) {
      const wouldIncrease =
        (dto.dailyMinutes && existing.dailyLimit && dto.dailyMinutes > existing.dailyLimit) ||
        (dto.weeklyMinutes && existing.weeklyLimit && dto.weeklyMinutes > existing.weeklyLimit) ||
        (dto.monthlyMinutes && existing.monthlyLimit && dto.monthlyMinutes > existing.monthlyLimit);

      if (wouldIncrease) {
        throw new AppError('RESPONSIBLE_GAMING_LIMIT_INCREASE_NOT_ALLOWED');
      }
    }

    return this.repo.upsertLimit({
      userId,
      type: 'TIME_ON_SITE',
      dailyLimit: dto.dailyMinutes ?? null,
      weeklyLimit: dto.weeklyMinutes ?? null,
      monthlyLimit: dto.monthlyMinutes ?? null,
      reason: dto.reason ?? null,
    });
  }
}
