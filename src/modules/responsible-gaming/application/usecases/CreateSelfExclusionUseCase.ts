import type { IResponsibleGamingRepository } from '../../domain/repositories/IResponsibleGamingRepository';
import type { SelfExclusionDTO } from '../dtos/SelfExclusionDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class CreateSelfExclusionUseCase {
  constructor(private readonly repo: IResponsibleGamingRepository) {}

  async execute(userId: string, dto: SelfExclusionDTO) {
    const existing = await this.repo.getExclusion(userId);
    if (existing && existing.type === 'AUTO') {
      throw new AppError('RESPONSIBLE_GAMING_SELF_EXCLUSION_ALREADY_ACTIVE');
    }

    return this.repo.upsertExclusion({
      userId,
      type: 'AUTO',
      autoPeriod: dto.duration,
      reason: dto.reason ?? null,
    });
  }
}
