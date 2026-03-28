import type { Request, Response } from 'express';
import { GetHomeDataUseCase } from '../../application/usecases/GetHomeDataUseCase';
import { GetHomeBannersUseCase } from '../../application/usecases/GetHomeBannersUseCase';
import { GetHomeShortcutsUseCase } from '../../application/usecases/GetHomeShortcutsUseCase';
import { PrismaHomeRepository } from '../../infra/repositories/PrismaHomeRepository';

export class HomeController {
  async getHomeData(_req: Request, res: Response): Promise<void> {
    const repo = new PrismaHomeRepository();
    const useCase = new GetHomeDataUseCase(repo);
    const result = await useCase.execute();
    res.json({ success: true, data: result });
  }

  async getBanners(_req: Request, res: Response): Promise<void> {
    const repo = new PrismaHomeRepository();
    const useCase = new GetHomeBannersUseCase(repo);
    const result = await useCase.execute();
    res.json({ success: true, data: result });
  }

  async getShortcuts(_req: Request, res: Response): Promise<void> {
    const repo = new PrismaHomeRepository();
    const useCase = new GetHomeShortcutsUseCase(repo);
    const result = await useCase.execute();
    res.json({ success: true, data: result });
  }
}
