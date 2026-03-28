import { prisma } from '../../../../shared/infra/database/prisma';
import type { IRecentGamesRepository, RecentGameData } from '../../domain/repositories/IRecentGamesRepository';

export class PrismaRecentGamesRepository implements IRecentGamesRepository {
  async findByUser(userId: string, limit: number): Promise<RecentGameData[]> {
    const rows = await prisma.recentGame.findMany({
      where: { userId },
      orderBy: { lastPlayedAt: 'desc' },
      take: limit,
      include: {
        game: {
          include: {
            provider: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      gameId: row.gameId,
      lastPlayedAt: row.lastPlayedAt,
      game: {
        id: row.game.id,
        name: row.game.name,
        slug: row.game.slug,
        imageUrl: row.game.imageUrl,
        type: row.game.type,
        isPopular: row.game.isPopular,
        isNew: row.game.isNew,
        provider: row.game.provider,
      },
    }));
  }

  async upsert(userId: string, gameId: string): Promise<void> {
    await prisma.recentGame.upsert({
      where: { userId_gameId: { userId, gameId } },
      update: { lastPlayedAt: new Date() },
      create: { userId, gameId },
    });
  }

  async enforceLimit(userId: string, limit: number): Promise<void> {
    const all = await prisma.recentGame.findMany({
      where: { userId },
      orderBy: { lastPlayedAt: 'desc' },
      select: { id: true },
    });

    if (all.length > limit) {
      const toDelete = all.slice(limit).map((r) => r.id);
      await prisma.recentGame.deleteMany({
        where: { id: { in: toDelete } },
      });
    }
  }
}
