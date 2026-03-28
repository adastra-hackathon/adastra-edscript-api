import type { UserSession } from '@prisma/client';

export interface CreateSessionData {
  userId: string;
  refreshTokenHash: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

export interface ISessionRepository {
  create(data: CreateSessionData): Promise<UserSession>;
  findByRefreshTokenHash(hash: string): Promise<UserSession | null>;
  revokeById(id: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}
