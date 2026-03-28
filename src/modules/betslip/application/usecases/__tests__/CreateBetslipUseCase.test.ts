import { CreateBetslipUseCase } from '../CreateBetslipUseCase';
import type { IBetslipRepository, BetSlipData } from '../../../domain/repositories/IBetslipRepository';
import type { CreateBetslipDTO } from '../../dtos/CreateBetslipDTO';

function makeBetSlip(overrides: Partial<BetSlipData> = {}): BetSlipData {
  return {
    id: 'betslip-1',
    userId: 'user-1',
    type: 'MULTIPLE',
    status: 'DRAFT',
    totalStake: 50,
    totalOdds: 3.7,
    potentialPayout: 185,
    acceptAnyOddsChange: false,
    acceptOnlyHigherOdds: false,
    selections: [
      {
        id: 'sel-1',
        betSlipId: 'betslip-1',
        eventId: 'event-1',
        eventName: 'Arsenal vs Chelsea',
        marketName: 'Resultado Final',
        selectionName: 'Arsenal',
        odd: 1.85,
        stake: null,
        sortOrder: 0,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepo(result: BetSlipData): IBetslipRepository {
  return {
    create: jest.fn().mockResolvedValue(result),
    findById: jest.fn().mockResolvedValue(result),
    findAllByUser: jest.fn().mockResolvedValue([result]),
    update: jest.fn().mockResolvedValue(result),
    submit: jest.fn().mockResolvedValue(result),
    removeSelection: jest.fn().mockResolvedValue(result),
    clear: jest.fn().mockResolvedValue(result),
  };
}

const baseDTO: CreateBetslipDTO = {
  type: 'MULTIPLE',
  selections: [
    {
      eventId: 'event-1',
      eventName: 'Arsenal vs Chelsea',
      marketName: 'Resultado Final',
      selectionName: 'Arsenal',
      odd: 1.85,
    },
  ],
  totalStake: 50,
  totalOdds: 3.7,
  potentialPayout: 185,
  acceptAnyOddsChange: false,
  acceptOnlyHigherOdds: false,
};

describe('CreateBetslipUseCase', () => {
  it('creates a betslip and returns the created data', async () => {
    const betslip = makeBetSlip();
    const repo = makeRepo(betslip);
    const useCase = new CreateBetslipUseCase(repo);

    const result = await useCase.execute('user-1', baseDTO);

    expect(result).toEqual(betslip);
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it('passes userId and selections to the repository', async () => {
    const betslip = makeBetSlip();
    const repo = makeRepo(betslip);
    const useCase = new CreateBetslipUseCase(repo);

    await useCase.execute('user-xyz', baseDTO);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-xyz',
        selections: baseDTO.selections,
      }),
    );
  });

  it('maps optional flags with defaults when not provided', async () => {
    const betslip = makeBetSlip();
    const repo = makeRepo(betslip);
    const useCase = new CreateBetslipUseCase(repo);

    const dto: CreateBetslipDTO = { ...baseDTO, acceptAnyOddsChange: undefined as any, acceptOnlyHigherOdds: undefined as any };
    await useCase.execute('user-1', dto);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptAnyOddsChange: false,
        acceptOnlyHigherOdds: false,
      }),
    );
  });
});
