import type { IGamesRepository, ProviderData, CategoryData } from '../../domain/repositories/IGamesRepository';

export interface GameFiltersResult {
  providers: ProviderData[];
  categories: CategoryData[];
}

export class GetGameFiltersUseCase {
  constructor(private readonly repo: IGamesRepository) {}

  async execute(): Promise<GameFiltersResult> {
    const [providers, categories] = await Promise.all([
      this.repo.findActiveProviders(),
      this.repo.findActiveCategories(),
    ]);
    return { providers, categories };
  }
}
