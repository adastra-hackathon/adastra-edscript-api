import { prisma } from '../../../../shared/infra/database/prisma';
import type { IFavoritesRepository, FavoriteGameData } from '../../domain/repositories/IFavoritesRepository';

export class PrismaFavoritesRepository implements IFavoritesRepository {
  async findByUser(userId: string): Promise<FavoriteGameData[]> {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            provider: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      gameId: row.gameId,
      createdAt: row.createdAt,
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

  async add(userId: string, gameId: string): Promise<void> {
    await prisma.favorite.create({
      data: { userId, gameId },
    });
  }

  async remove(userId: string, gameId: string): Promise<void> {
    await prisma.favorite.deleteMany({
      where: { userId, gameId },
    });
  }

  async exists(userId: string, gameId: string): Promise<boolean> {
    const count = await prisma.favorite.count({
      where: { userId, gameId },
    });
    return count > 0;
  }
}
