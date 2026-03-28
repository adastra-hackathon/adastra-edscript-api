export interface RecentGameData {
  id: string;
  gameId: string;
  lastPlayedAt: Date;
  game: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    type: string;
    isPopular: boolean;
    isNew: boolean;
    provider: { id: string; name: string; slug: string };
  };
}

export interface IRecentGamesRepository {
  findByUser(userId: string, limit: number): Promise<RecentGameData[]>;
  upsert(userId: string, gameId: string): Promise<void>;
  enforceLimit(userId: string, limit: number): Promise<void>;
}
