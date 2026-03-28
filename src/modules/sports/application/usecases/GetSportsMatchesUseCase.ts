import type { ISportsRepository, MatchData } from '../../domain/repositories/ISportsRepository';

interface GetSportsMatchesFilters {
  sport?: string;
  isLive?: boolean;
}

interface GetSportsMatchesResult {
  matches: MatchData[];
}

export class GetSportsMatchesUseCase {
  constructor(private readonly repo: ISportsRepository) {}

  async execute(filters: GetSportsMatchesFilters): Promise<GetSportsMatchesResult> {
    const matches = await this.repo.findMatches(filters);
    return { matches };
  }
}
