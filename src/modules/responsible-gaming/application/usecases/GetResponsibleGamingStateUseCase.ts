import type { IResponsibleGamingRepository } from '../../domain/repositories/IResponsibleGamingRepository';

export interface ResponsibleGamingStateResponse {
  betLimit: {
    dailyAmount: number | null;
    weeklyAmount: number | null;
    monthlyAmount: number | null;
    reason: string | null;
    updatedAt: Date;
  } | null;
  depositLimit: {
    dailyAmount: number | null;
    weeklyAmount: number | null;
    monthlyAmount: number | null;
    reason: string | null;
    updatedAt: Date;
  } | null;
  sessionTimeLimit: {
    dailyMinutes: number | null;
    weeklyMinutes: number | null;
    monthlyMinutes: number | null;
    reason: string | null;
    updatedAt: Date;
  } | null;
  selfExclusion: {
    type: string;
    untilDate: Date | null;
    duration: string | null;
    isActive: boolean;
    reason: string | null;
    updatedAt: Date;
  } | null;
}

export class GetResponsibleGamingStateUseCase {
  constructor(private readonly repo: IResponsibleGamingRepository) {}

  async execute(userId: string): Promise<ResponsibleGamingStateResponse> {
    const [limits, exclusion] = await Promise.all([
      this.repo.getLimitsByUserId(userId),
      this.repo.getExclusion(userId),
    ]);

    const betLimit = limits.find((l) => l.type === 'BET_AMOUNT');
    const depositLimit = limits.find((l) => l.type === 'DEPOSIT_AMOUNT');
    const timeLimit = limits.find((l) => l.type === 'TIME_ON_SITE');

    const isExclusionActive = exclusion
      ? exclusion.type === 'AUTO' || (exclusion.excludeUntil !== null && new Date() < exclusion.excludeUntil)
      : false;

    return {
      betLimit: betLimit
        ? {
            dailyAmount: betLimit.dailyLimit,
            weeklyAmount: betLimit.weeklyLimit,
            monthlyAmount: betLimit.monthlyLimit,
            reason: betLimit.reason,
            updatedAt: betLimit.updatedAt,
          }
        : null,
      depositLimit: depositLimit
        ? {
            dailyAmount: depositLimit.dailyLimit,
            weeklyAmount: depositLimit.weeklyLimit,
            monthlyAmount: depositLimit.monthlyLimit,
            reason: depositLimit.reason,
            updatedAt: depositLimit.updatedAt,
          }
        : null,
      sessionTimeLimit: timeLimit
        ? {
            dailyMinutes: timeLimit.dailyLimit ? Math.round(timeLimit.dailyLimit) : null,
            weeklyMinutes: timeLimit.weeklyLimit ? Math.round(timeLimit.weeklyLimit) : null,
            monthlyMinutes: timeLimit.monthlyLimit ? Math.round(timeLimit.monthlyLimit) : null,
            reason: timeLimit.reason,
            updatedAt: timeLimit.updatedAt,
          }
        : null,
      selfExclusion: exclusion
        ? {
            type: exclusion.type,
            untilDate: exclusion.excludeUntil,
            duration: exclusion.autoPeriod,
            isActive: isExclusionActive,
            reason: exclusion.reason,
            updatedAt: exclusion.updatedAt,
          }
        : null,
    };
  }
}
