import type { IResponsibleGamingRepository } from '../../domain/repositories/IResponsibleGamingRepository';
import type { TimedSelfExclusionDTO } from '../dtos/SelfExclusionDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class CreateTimedSelfExclusionUseCase {
  constructor(private readonly repo: IResponsibleGamingRepository) {}

  async execute(userId: string, dto: TimedSelfExclusionDTO) {
    const existing = await this.repo.getExclusion(userId);
    if (existing && existing.type === 'AUTO') {
      throw new AppError('RESPONSIBLE_GAMING_SELF_EXCLUSION_ALREADY_ACTIVE');
    }

    const excludeUntil = new Date(dto.untilDate);
    if (excludeUntil <= new Date()) {
      throw new AppError('RESPONSIBLE_GAMING_INVALID_EXCLUSION_DATE');
    }

    return this.repo.upsertExclusion({
      userId,
      type: 'TIMED',
      excludeUntil,
      reason: dto.reason ?? null,
    });
  }
}
