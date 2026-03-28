import { GetHomeBannersUseCase } from '../GetHomeBannersUseCase';
import { GetHomeDataUseCase } from '../GetHomeDataUseCase';
import type { IHomeRepository, BannerData, ShortcutData } from '../../../domain/repositories/IHomeRepository';

const makeBanner = (overrides: Partial<BannerData> = {}): BannerData => ({
  id: 'b-1',
  title: 'Sweet Rush Bonanza',
  subtitle: 'Big Wins Await!',
  imageUrl: 'https://example.com/banner.jpg',
  mobileImageUrl: 'https://example.com/banner-mobile.jpg',
  redirectType: 'game',
  redirectValue: 'sweet-bonanza',
  sortOrder: 1,
  ...overrides,
});

const makeShortcut = (overrides: Partial<ShortcutData> = {}): ShortcutData => ({
  id: 's-1',
  title: 'Missões',
  imageUrl: 'https://example.com/shortcut.jpg',
  redirectType: 'screen',
  redirectValue: 'Missions',
  sortOrder: 1,
  ...overrides,
});

function makeRepo(
  banners: BannerData[] = [],
  shortcuts: ShortcutData[] = []
): IHomeRepository {
  return {
    findActiveBanners: jest.fn().mockResolvedValue(banners),
    findActiveShortcuts: jest.fn().mockResolvedValue(shortcuts),
  };
}

describe('GetHomeBannersUseCase', () => {
  it('returns active banners from repository', async () => {
    const banner = makeBanner();
    const repo = makeRepo([banner]);
    const useCase = new GetHomeBannersUseCase(repo);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Sweet Rush Bonanza');
  });

  it('returns empty array when no active banners', async () => {
    const repo = makeRepo([]);
    const useCase = new GetHomeBannersUseCase(repo);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });

  it('returns banners in sortOrder', async () => {
    const banners = [
      makeBanner({ id: 'b-1', sortOrder: 1 }),
      makeBanner({ id: 'b-2', sortOrder: 2 }),
    ];
    const repo = makeRepo(banners);
    const useCase = new GetHomeBannersUseCase(repo);

    const result = await useCase.execute();

    expect(result[0].sortOrder).toBeLessThan(result[1].sortOrder);
  });

  it('banner includes both desktop and mobile image URLs', async () => {
    const banner = makeBanner();
    const repo = makeRepo([banner]);
    const useCase = new GetHomeBannersUseCase(repo);

    const result = await useCase.execute();

    expect(result[0].imageUrl).toBeDefined();
    expect(result[0].mobileImageUrl).toBeDefined();
  });
});

describe('GetHomeDataUseCase', () => {
  it('returns banners and shortcuts combined', async () => {
    const banner = makeBanner();
    const shortcut = makeShortcut();
    const repo = makeRepo([banner], [shortcut]);
    const useCase = new GetHomeDataUseCase(repo);

    const result = await useCase.execute();

    expect(result.banners).toHaveLength(1);
    expect(result.shortcuts).toHaveLength(1);
    expect(result.banners[0].title).toBe('Sweet Rush Bonanza');
    expect(result.shortcuts[0].title).toBe('Missões');
  });

  it('calls both repository methods in parallel', async () => {
    const repo = makeRepo([], []);
    const useCase = new GetHomeDataUseCase(repo);

    await useCase.execute();

    expect(repo.findActiveBanners).toHaveBeenCalledTimes(1);
    expect(repo.findActiveShortcuts).toHaveBeenCalledTimes(1);
  });
});
