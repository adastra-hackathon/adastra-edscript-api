import { GetSportsMatchesUseCase } from '../GetSportsMatchesUseCase';
import type { ISportsRepository, MatchData } from '../../../domain/repositories/ISportsRepository';

const makeMatch = (overrides: Partial<MatchData> = {}): MatchData => ({
  id: 'match-1',
  sport: 'football',
  league: 'Premier League',
  homeTeam: 'Arsenal',
  awayTeam: 'Chelsea',
  homeLogoUrl: 'https://example.com/arsenal.png',
  awayLogoUrl: 'https://example.com/chelsea.png',
  startTime: new Date('2024-06-10T15:00:00Z'),
  isLive: false,
  oddsHome: 1.85,
  oddsDraw: 3.4,
  oddsAway: 4.2,
  homeScore: null,
  awayScore: null,
  minute: null,
  ...overrides,
});

function makeRepo(matches: MatchData[] = []): ISportsRepository {
  return {
    findMatches: jest.fn().mockResolvedValue(matches),
  };
}

describe('GetSportsMatchesUseCase', () => {
  it('returns all matches when no filters are applied', async () => {
    const matches = [makeMatch(), makeMatch({ id: 'match-2', homeTeam: 'Liverpool' })];
    const repo = makeRepo(matches);
    const useCase = new GetSportsMatchesUseCase(repo);

    const result = await useCase.execute({});

    expect(result.matches).toHaveLength(2);
    expect(repo.findMatches).toHaveBeenCalledWith({});
  });

  it('filters matches by sport', async () => {
    const footballMatch = makeMatch({ sport: 'football' });
    const repo = makeRepo([footballMatch]);
    const useCase = new GetSportsMatchesUseCase(repo);

    const result = await useCase.execute({ sport: 'football' });

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].sport).toBe('football');
    expect(repo.findMatches).toHaveBeenCalledWith({ sport: 'football' });
  });

  it('filters matches by isLive', async () => {
    const liveMatch = makeMatch({ isLive: true, homeScore: 1, awayScore: 0, minute: 42 });
    const repo = makeRepo([liveMatch]);
    const useCase = new GetSportsMatchesUseCase(repo);

    const result = await useCase.execute({ isLive: true });

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].isLive).toBe(true);
    expect(repo.findMatches).toHaveBeenCalledWith({ isLive: true });
  });

  it('returns empty matches array when no matches are found', async () => {
    const repo = makeRepo([]);
    const useCase = new GetSportsMatchesUseCase(repo);

    const result = await useCase.execute({ sport: 'tennis' });

    expect(result.matches).toHaveLength(0);
    expect(result).toEqual({ matches: [] });
  });
});
