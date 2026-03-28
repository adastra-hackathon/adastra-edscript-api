import type { IBetslipRepository, BetSlipData } from '../../domain/repositories/IBetslipRepository';

export class ListBetslipsUseCase {
  constructor(private readonly repo: IBetslipRepository) {}

  async execute(userId: string): Promise<BetSlipData[]> {
    return this.repo.findAllByUser(userId);
  }
}
