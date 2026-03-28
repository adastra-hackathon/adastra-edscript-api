import { prisma } from '../../../../shared/infra/database/prisma';
import type {
  IGamesRepository,
  GameFilters,
  GameData,
  GameDetailData,
  PaginatedGames,
  ProviderData,
  CategoryData,
} from '../../domain/repositories/IGamesRepository';
import type { Prisma } from '@prisma/client';

export class PrismaGamesRepository implements IGamesRepository {
  async findGames(filters: GameFilters): Promise<PaginatedGames> {
    const {
      type,
      search,
      providers = [],
      categories = [],
      sort = 'default',
      page = 1,
      limit = 20,
    } = filters;

    const where: Prisma.GameWhereInput = { isActive: true };

    if (type) where.type = type;

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (providers.length > 0) {
      where.provider = { slug: { in: providers } };
    }

    if (categories.length > 0) {
      where.categories = {
        some: { category: { slug: { in: categories } } },
      };
    }

    let orderBy: Prisma.GameOrderByWithRelationInput;
    if (sort === 'a-z') {
      orderBy = { name: 'asc' };
    } else if (sort === 'new') {
      orderBy = { createdAt: 'desc' };
    } else {
      orderBy = { sortOrder: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [rawGames, total] = await Promise.all([
      prisma.game.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          provider: { select: { id: true, name: true, slug: true } },
          categories: {
            include: { category: { select: { id: true, name: true, slug: true } } },
          },
        },
      }),
      prisma.game.count({ where }),
    ]);

    const games: GameData[] = rawGames.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      imageUrl: g.imageUrl,
      type: g.type,
      isPopular: g.isPopular,
      isNew: g.isNew,
      sortOrder: g.sortOrder,
      provider: g.provider,
      categories: g.categories.map((r) => r.category),
    }));

    return {
      games,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActiveProviders(): Promise<ProviderData[]> {
    const rows = await prisma.provider.findMany({
      where: {
        isActive: true,
        games: { some: { isActive: true } },
      },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });
    return rows;
  }

  async findActiveCategories(): Promise<CategoryData[]> {
    const rows = await prisma.gameCategory.findMany({
      where: {
        isActive: true,
        games: { some: { game: { isActive: true } } },
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { games: { where: { game: { isActive: true } } } } },
      },
    });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      sortOrder: c.sortOrder,
      gameCount: c._count.games,
    }));
  }

  async findGameBySlug(slug: string): Promise<GameDetailData | null> {
    const g = await prisma.game.findFirst({
      where: { slug, isActive: true },
      include: {
        provider: { select: { id: true, name: true, slug: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
      },
    });
    if (!g) return null;
    return {
      id: g.id,
      name: g.name,
      slug: g.slug,
      imageUrl: g.imageUrl,
      type: g.type,
      isPopular: g.isPopular,
      isNew: g.isNew,
      sortOrder: g.sortOrder,
      description: g.description,
      rtp: g.rtp,
      volatility: g.volatility,
      minBet: g.minBet,
      maxBet: g.maxBet,
      dealerName: g.dealerName,
      playersCount: g.playersCount,
      provider: g.provider,
      categories: g.categories.map((r) => r.category),
    };
  }
}
