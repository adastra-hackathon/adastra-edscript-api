import { RemoveSelectionUseCase } from '../RemoveSelectionUseCase';
import { AppError } from '../../../../../shared/errors/AppError';
import type { IBetslipRepository, BetSlipData } from '../../../domain/repositories/IBetslipRepository';

function makeSelection(id: string = 'sel-1') {
  return {
    id,
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
    totalOdds: 1.85,
    potentialPayout: 92.5,
    acceptAnyOddsChange: false,
    acceptOnlyHigherOdds: false,
    selections: [makeSelection('sel-1')],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepo(findResult: BetSlipData | null, removeResult?: BetSlipData): IBetslipRepository {
  return {
    create: jest.fn(),
    findById: jest.fn().mockResolvedValue(findResult),
    findAllByUser: jest.fn(),
    update: jest.fn(),
    submit: jest.fn(),
    removeSelection: jest.fn().mockResolvedValue(removeResult ?? { ...(findResult ?? {}), selections: [] }),
    clear: jest.fn(),
  };
}

describe('RemoveSelectionUseCase', () => {
  it('removes a selection from the betslip and returns updated betslip', async () => {
    const betslip = makeBetSlip();
    const updated = { ...betslip, selections: [] };
    const repo = makeRepo(betslip, updated);
    const useCase = new RemoveSelectionUseCase(repo);

    const result = await useCase.execute('betslip-1', 'sel-1', 'user-1');

    expect(result.selections).toHaveLength(0);
    expect(repo.removeSelection).toHaveBeenCalledWith('betslip-1', 'sel-1', 'user-1');
  });

  it('throws BETSLIP_NOT_FOUND when betslip does not exist', async () => {
    const repo = makeRepo(null);
    const useCase = new RemoveSelectionUseCase(repo);

    await expect(useCase.execute('non-existent', 'sel-1', 'user-1')).rejects.toThrow(AppError);
    await expect(useCase.execute('non-existent', 'sel-1', 'user-1')).rejects.toMatchObject({ code: 'BETSLIP_NOT_FOUND' });
    expect(repo.removeSelection).not.toHaveBeenCalled();
  });

  it('throws SELECTION_NOT_FOUND when selectionId is not in the betslip', async () => {
    const betslip = makeBetSlip({ selections: [makeSelection('sel-1')] });
    const repo = makeRepo(betslip);
    const useCase = new RemoveSelectionUseCase(repo);

    await expect(useCase.execute('betslip-1', 'sel-999', 'user-1')).rejects.toThrow(AppError);
    await expect(useCase.execute('betslip-1', 'sel-999', 'user-1')).rejects.toMatchObject({ code: 'SELECTION_NOT_FOUND' });
    expect(repo.removeSelection).not.toHaveBeenCalled();
  });
});
