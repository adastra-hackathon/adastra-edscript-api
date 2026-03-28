import { prisma } from '../../../../shared/infra/database/prisma';
import type { ISportsRepository, MatchData } from '../../domain/repositories/ISportsRepository';
import type { Prisma } from '@prisma/client';

export class PrismaSportsRepository implements ISportsRepository {
  async findMatches(filters: { sport?: string; isLive?: boolean }): Promise<MatchData[]> {
    const where: Prisma.SportsMatchWhereInput = { isActive: true };

    if (filters.sport !== undefined) {
      where.sport = filters.sport;
    }

    if (filters.isLive !== undefined) {
      where.isLive = filters.isLive;
    }

    const rows = await prisma.sportsMatch.findMany({
      where,
      orderBy: [{ isLive: 'desc' }, { startTime: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      sport: row.sport,
      league: row.league,
      homeTeam: row.homeTeam,
      awayTeam: row.awayTeam,
      homeLogoUrl: row.homeLogoUrl,
      awayLogoUrl: row.awayLogoUrl,
      startTime: row.startTime,
      isLive: row.isLive,
      oddsHome: row.oddsHome,
      oddsDraw: row.oddsDraw,
      oddsAway: row.oddsAway,
      homeScore: row.homeScore,
      awayScore: row.awayScore,
      minute: row.minute,
    }));
  }
}
