export interface BannerData {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  redirectType: string | null;
  redirectValue: string | null;
  sortOrder: number;
}

export interface ShortcutData {
  id: string;
  title: string;
  imageUrl: string | null;
  redirectType: string | null;
  redirectValue: string | null;
  sortOrder: number;
}

export interface IHomeRepository {
  findActiveBanners(): Promise<BannerData[]>;
  findActiveShortcuts(): Promise<ShortcutData[]>;
}
