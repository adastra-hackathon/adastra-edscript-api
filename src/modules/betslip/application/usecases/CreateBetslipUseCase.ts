import type { IBetslipRepository, BetSlipData, CreateBetSlipInput } from '../../domain/repositories/IBetslipRepository';
import type { CreateBetslipDTO } from '../dtos/CreateBetslipDTO';

export class CreateBetslipUseCase {
  constructor(private readonly repo: IBetslipRepository) {}

  async execute(userId: string, dto: CreateBetslipDTO): Promise<BetSlipData> {
    const input: CreateBetSlipInput = {
      userId,
      type: dto.type,
      selections: dto.selections,
      totalStake: dto.totalStake,
      totalOdds: dto.totalOdds,
      potentialPayout: dto.potentialPayout,
      acceptAnyOddsChange: dto.acceptAnyOddsChange ?? false,
      acceptOnlyHigherOdds: dto.acceptOnlyHigherOdds ?? false,
    };
    return this.repo.create(input);
  }
}
