import type { GamingLimitType, ExclusionType } from '@prisma/client';

export interface GamingLimitData {
  type: GamingLimitType;
  dailyLimit: number | null;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
  reason: string | null;
  lastActivityAt: Date | null;
  updatedAt: Date;
}

export interface ExclusionData {
  type: ExclusionType;
  excludeUntil: Date | null;
  autoPeriod: string | null;
  reason: string | null;
  lastActivityAt: Date | null;
  updatedAt: Date;
}

export interface UpsertGamingLimitInput {
  userId: string;
  type: GamingLimitType;
  dailyLimit: number | null;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
  reason: string | null;
}

export interface UpsertExclusionInput {
  userId: string;
  type: ExclusionType;
  excludeUntil?: Date | null;
  autoPeriod?: string | null;
  reason: string | null;
}

export interface IResponsibleGamingRepository {
  getLimitsByUserId(userId: string): Promise<GamingLimitData[]>;
  getLimitByType(userId: string, type: GamingLimitType): Promise<GamingLimitData | null>;
  upsertLimit(input: UpsertGamingLimitInput): Promise<GamingLimitData>;
  resetLimit(userId: string, type: GamingLimitType): Promise<void>;
  getExclusion(userId: string): Promise<ExclusionData | null>;
  upsertExclusion(input: UpsertExclusionInput): Promise<ExclusionData>;
}
