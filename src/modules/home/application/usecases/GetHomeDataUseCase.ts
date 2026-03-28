import type { IHomeRepository, BannerData, ShortcutData } from '../../domain/repositories/IHomeRepository';

export interface HomeData {
  banners: BannerData[];
  shortcuts: ShortcutData[];
}

export class GetHomeDataUseCase {
  constructor(private readonly repo: IHomeRepository) {}

  async execute(): Promise<HomeData> {
    const [banners, shortcuts] = await Promise.all([
      this.repo.findActiveBanners(),
      this.repo.findActiveShortcuts(),
    ]);
    return { banners, shortcuts };
  }
}
