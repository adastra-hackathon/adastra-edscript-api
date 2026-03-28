import { prisma } from '../../../../shared/infra/database/prisma';
import type { CreateSessionData, ISessionRepository } from '../../domain/repositories/ISessionRepository';
import type { UserSession } from '@prisma/client';

export class PrismaSessionRepository implements ISessionRepository {
  async create(data: CreateSessionData): Promise<UserSession> {
    return prisma.userSession.create({ data });
  }

  async findByRefreshTokenHash(hash: string): Promise<UserSession | null> {
    return prisma.userSession.findUnique({
      where: { refreshTokenHash: hash },
    });
  }

  async revokeById(id: string): Promise<void> {
    await prisma.userSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
