import type { IHomeRepository, BannerData } from '../../domain/repositories/IHomeRepository';

export class GetHomeBannersUseCase {
  constructor(private readonly repo: IHomeRepository) {}

  async execute(): Promise<BannerData[]> {
    return this.repo.findActiveBanners();
  }
}
