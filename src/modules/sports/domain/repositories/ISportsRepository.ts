export interface MatchData {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  startTime: Date;
  isLive: boolean;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
}

export interface ISportsRepository {
  findMatches(filters: { sport?: string; isLive?: boolean }): Promise<MatchData[]>;
}
