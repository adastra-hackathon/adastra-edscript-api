export interface GameFilters {
  type?: 'CASINO' | 'LIVE_CASINO';
  search?: string;
  providers?: string[];    // provider slugs
  categories?: string[];   // category slugs
  sort?: 'default' | 'a-z' | 'new';
  page?: number;
  limit?: number;
}

export interface GameData {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  type: 'CASINO' | 'LIVE_CASINO';
  isPopular: boolean;
  isNew: boolean;
  sortOrder: number;
  provider: { id: string; name: string; slug: string };
  categories: Array<{ id: string; name: string; slug: string }>;
}

export interface ProviderData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  gameCount: number;
}

export interface PaginatedGames {
  games: GameData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GameDetailData extends GameData {
  description: string | null;
  rtp: number | null;
  volatility: string | null;
  minBet: number | null;
  maxBet: number | null;
  dealerName: string | null;
  playersCount: number | null;
}

export interface IGamesRepository {
  findGames(filters: GameFilters): Promise<PaginatedGames>;
  findActiveProviders(): Promise<ProviderData[]>;
  findActiveCategories(): Promise<CategoryData[]>;
  findGameBySlug(slug: string): Promise<GameDetailData | null>;
}
