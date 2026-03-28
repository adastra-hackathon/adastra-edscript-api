import type { IHomeRepository, ShortcutData } from '../../domain/repositories/IHomeRepository';

export class GetHomeShortcutsUseCase {
  constructor(private readonly repo: IHomeRepository) {}

  async execute(): Promise<ShortcutData[]> {
    return this.repo.findActiveShortcuts();
  }
}
