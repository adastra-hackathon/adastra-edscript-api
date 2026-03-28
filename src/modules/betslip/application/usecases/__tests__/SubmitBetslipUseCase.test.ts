import { SubmitBetslipUseCase } from '../SubmitBetslipUseCase';
import { AppError } from '../../../../../shared/errors/AppError';
import type { IBetslipRepository, BetSlipData } from '../../../domain/repositories/IBetslipRepository';

function makeSelection() {
  return {
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
  };
}

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
    selections: [makeSelection()],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepo(findResult: BetSlipData | null, submitResult?: BetSlipData): IBetslipRepository {
  return {
    create: jest.fn(),
    findById: jest.fn().mockResolvedValue(findResult),
    findAllByUser: jest.fn(),
    update: jest.fn(),
    submit: jest.fn().mockResolvedValue(submitResult ?? (findResult ? { ...findResult, status: 'SUBMITTED' } : null)),
    removeSelection: jest.fn(),
    clear: jest.fn(),
  };
}

describe('SubmitBetslipUseCase', () => {
  it('submits a DRAFT betslip successfully', async () => {
    const betslip = makeBetSlip({ status: 'DRAFT' });
    const submitted = { ...betslip, status: 'SUBMITTED' as const };
    const repo = makeRepo(betslip, submitted);
    const useCase = new SubmitBetslipUseCase(repo);

    const result = await useCase.execute('betslip-1', 'user-1');

    expect(result.status).toBe('SUBMITTED');
    expect(repo.submit).toHaveBeenCalledWith('betslip-1', 'user-1');
  });

  it('throws BETSLIP_NOT_FOUND when betslip does not exist', async () => {
    const repo = makeRepo(null);
    const useCase = new SubmitBetslipUseCase(repo);

    await expect(useCase.execute('non-existent', 'user-1')).rejects.toThrow(AppError);
    await expect(useCase.execute('non-existent', 'user-1')).rejects.toMatchObject({ code: 'BETSLIP_NOT_FOUND' });
    expect(repo.submit).not.toHaveBeenCalled();
  });

  it('throws BETSLIP_ALREADY_SUBMITTED when status is not DRAFT', async () => {
    const betslip = makeBetSlip({ status: 'SUBMITTED' });
    const repo = makeRepo(betslip);
    const useCase = new SubmitBetslipUseCase(repo);

    await expect(useCase.execute('betslip-1', 'user-1')).rejects.toThrow(AppError);
    await expect(useCase.execute('betslip-1', 'user-1')).rejects.toMatchObject({ code: 'BETSLIP_ALREADY_SUBMITTED' });
    expect(repo.submit).not.toHaveBeenCalled();
  });

  it('throws BETSLIP_EMPTY when betslip has no selections', async () => {
    const betslip = makeBetSlip({ status: 'DRAFT', selections: [] });
    const repo = makeRepo(betslip);
    const useCase = new SubmitBetslipUseCase(repo);

    await expect(useCase.execute('betslip-1', 'user-1')).rejects.toThrow(AppError);
    await expect(useCase.execute('betslip-1', 'user-1')).rejects.toMatchObject({ code: 'BETSLIP_EMPTY' });
    expect(repo.submit).not.toHaveBeenCalled();
  });
});
