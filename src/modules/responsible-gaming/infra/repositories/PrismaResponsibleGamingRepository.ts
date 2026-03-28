import { GamingLimitType, ExclusionType } from '@prisma/client';
import { prisma } from '../../../../shared/infra/database/prisma';
import type {
  IResponsibleGamingRepository,
  GamingLimitData,
  ExclusionData,
  UpsertGamingLimitInput,
  UpsertExclusionInput,
} from '../../domain/repositories/IResponsibleGamingRepository';

function mapLimit(row: {
  type: GamingLimitType;
  dailyLimit: { toString(): string } | null;
  weeklyLimit: { toString(): string } | null;
  monthlyLimit: { toString(): string } | null;
  reason: string | null;
  lastActivityAt: Date | null;
  updatedAt: Date;
}): GamingLimitData {
  return {
    type: row.type,
    dailyLimit: row.dailyLimit ? parseFloat(row.dailyLimit.toString()) : null,
    weeklyLimit: row.weeklyLimit ? parseFloat(row.weeklyLimit.toString()) : null,
    monthlyLimit: row.monthlyLimit ? parseFloat(row.monthlyLimit.toString()) : null,
    reason: row.reason,
    lastActivityAt: row.lastActivityAt,
    updatedAt: row.updatedAt,
  };
}

function mapExclusion(row: {
  type: ExclusionType;
  excludeUntil: Date | null;
  autoPeriod: string | null;
  reason: string | null;
  lastActivityAt: Date | null;
  updatedAt: Date;
}): ExclusionData {
  return {
    type: row.type,
    excludeUntil: row.excludeUntil,
    autoPeriod: row.autoPeriod,
    reason: row.reason,
    lastActivityAt: row.lastActivityAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaResponsibleGamingRepository implements IResponsibleGamingRepository {
  async getLimitsByUserId(userId: string): Promise<GamingLimitData[]> {
    const rows = await prisma.userGamingLimit.findMany({ where: { userId } });
    return rows.map(mapLimit);
  }

  async getLimitByType(userId: string, type: GamingLimitType): Promise<GamingLimitData | null> {
    const row = await prisma.userGamingLimit.findUnique({ where: { userId_type: { userId, type } } });
    return row ? mapLimit(row) : null;
  }

  async upsertLimit(input: UpsertGamingLimitInput): Promise<GamingLimitData> {
    const row = await prisma.userGamingLimit.upsert({
      where: { userId_type: { userId: input.userId, type: input.type } },
      create: {
        userId: input.userId,
        type: input.type,
        dailyLimit: input.dailyLimit,
        weeklyLimit: input.weeklyLimit,
        monthlyLimit: input.monthlyLimit,
        reason: input.reason,
      },
      update: {
        dailyLimit: input.dailyLimit,
        weeklyLimit: input.weeklyLimit,
        monthlyLimit: input.monthlyLimit,
        reason: input.reason,
      },
    });
    return mapLimit(row);
  }

  async resetLimit(userId: string, type: GamingLimitType): Promise<void> {
    await prisma.userGamingLimit.deleteMany({ where: { userId, type } });
  }

  async getExclusion(userId: string): Promise<ExclusionData | null> {
    const row = await prisma.userExclusion.findUnique({ where: { userId } });
    return row ? mapExclusion(row) : null;
  }

  async upsertExclusion(input: UpsertExclusionInput): Promise<ExclusionData> {
    const row = await prisma.userExclusion.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        type: input.type,
        excludeUntil: input.excludeUntil ?? null,
        autoPeriod: input.autoPeriod ?? null,
        reason: input.reason,
      },
      update: {
        type: input.type,
        excludeUntil: input.excludeUntil ?? null,
        autoPeriod: input.autoPeriod ?? null,
        reason: input.reason,
      },
    });
    return mapExclusion(row);
  }
}
