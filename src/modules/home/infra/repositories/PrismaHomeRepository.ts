import { prisma } from '../../../../shared/infra/database/prisma';
import type { IHomeRepository, BannerData, ShortcutData } from '../../domain/repositories/IHomeRepository';

export class PrismaHomeRepository implements IHomeRepository {
  async findActiveBanners(): Promise<BannerData[]> {
    const now = new Date();
    const rows = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.imageUrl,
      mobileImageUrl: b.mobileImageUrl,
      redirectType: b.redirectType,
      redirectValue: b.redirectValue,
      sortOrder: b.sortOrder,
    }));
  }

  async findActiveShortcuts(): Promise<ShortcutData[]> {
    const rows = await prisma.homeShortcut.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((s) => ({
      id: s.id,
      title: s.title,
      imageUrl: s.imageUrl,
      redirectType: s.redirectType,
      redirectValue: s.redirectValue,
      sortOrder: s.sortOrder,
    }));
  }
}
