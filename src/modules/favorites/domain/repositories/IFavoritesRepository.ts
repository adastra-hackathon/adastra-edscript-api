export interface FavoriteGameData {
  id: string;
  gameId: string;
  createdAt: Date;
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

export interface IFavoritesRepository {
  findByUser(userId: string): Promise<FavoriteGameData[]>;
  add(userId: string, gameId: string): Promise<void>;
  remove(userId: string, gameId: string): Promise<void>;
  exists(userId: string, gameId: string): Promise<boolean>;
}
