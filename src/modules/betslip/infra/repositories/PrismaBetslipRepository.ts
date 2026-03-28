import { prisma } from '../../../../shared/infra/database/prisma';
import type { IBetslipRepository, BetSlipData, CreateBetSlipInput, UpdateBetSlipInput } from '../../domain/repositories/IBetslipRepository';

function toNumber(d: any): number {
  return typeof d === 'object' && d !== null && 'toNumber' in d ? d.toNumber() : Number(d);
}

function mapBetSlip(raw: any): BetSlipData {
  return {
    id: raw.id,
    userId: raw.userId,
    type: raw.type,
    status: raw.status,
    totalStake: toNumber(raw.totalStake),
    totalOdds: toNumber(raw.totalOdds),
    potentialPayout: toNumber(raw.potentialPayout),
    acceptAnyOddsChange: raw.acceptAnyOddsChange,
    acceptOnlyHigherOdds: raw.acceptOnlyHigherOdds,
    selections: (raw.selections ?? []).map((s: any) => ({
      id: s.id,
      betSlipId: s.betSlipId,
      eventId: s.eventId,
      eventName: s.eventName,
      marketName: s.marketName,
      selectionName: s.selectionName,
      odd: toNumber(s.odd),
      stake: s.stake != null ? toNumber(s.stake) : null,
      sortOrder: s.sortOrder,
      createdAt: s.createdAt,
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

const WITH_SELECTIONS = {
  selections: { orderBy: { sortOrder: 'asc' as const } },
};

export class PrismaBetslipRepository implements IBetslipRepository {
  async create(input: CreateBetSlipInput): Promise<BetSlipData> {
    const raw = await prisma.betSlip.create({
      data: {
        userId: input.userId,
        type: input.type,
        totalStake: input.totalStake,
        totalOdds: input.totalOdds,
        potentialPayout: input.potentialPayout,
        acceptAnyOddsChange: input.acceptAnyOddsChange ?? false,
        acceptOnlyHigherOdds: input.acceptOnlyHigherOdds ?? false,
        selections: {
          create: input.selections.map((s, i) => ({
            eventId: s.eventId,
            eventName: s.eventName,
            marketName: s.marketName,
            selectionName: s.selectionName,
            odd: s.odd,
            stake: s.stake ?? null,
            sortOrder: s.sortOrder ?? i,
          })),
        },
      },
      include: WITH_SELECTIONS,
    });
    return mapBetSlip(raw);
  }

  async findById(id: string, userId: string): Promise<BetSlipData | null> {
    const raw = await prisma.betSlip.findFirst({
      where: { id, userId },
      include: WITH_SELECTIONS,
    });
    return raw ? mapBetSlip(raw) : null;
  }

  async findAllByUser(userId: string): Promise<BetSlipData[]> {
    const raws = await prisma.betSlip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: WITH_SELECTIONS,
    });
    return raws.map(mapBetSlip);
  }

  async update(id: string, _userId: string, input: UpdateBetSlipInput): Promise<BetSlipData> {
    const raw = await prisma.betSlip.update({
      where: { id },
      data: {
        ...(input.totalStake !== undefined && { totalStake: input.totalStake }),
        ...(input.totalOdds !== undefined && { totalOdds: input.totalOdds }),
        ...(input.potentialPayout !== undefined && { potentialPayout: input.potentialPayout }),
        ...(input.acceptAnyOddsChange !== undefined && { acceptAnyOddsChange: input.acceptAnyOddsChange }),
        ...(input.acceptOnlyHigherOdds !== undefined && { acceptOnlyHigherOdds: input.acceptOnlyHigherOdds }),
      },
      include: WITH_SELECTIONS,
    });
    return mapBetSlip(raw);
  }

  async submit(id: string, _userId: string): Promise<BetSlipData> {
    const raw = await prisma.betSlip.update({
      where: { id },
      data: { status: 'SUBMITTED' },
      include: WITH_SELECTIONS,
    });
    return mapBetSlip(raw);
  }

  async removeSelection(betSlipId: string, selectionId: string, _userId: string): Promise<BetSlipData> {
    await prisma.betSlipSelection.delete({ where: { id: selectionId } });
    const raw = await prisma.betSlip.findUniqueOrThrow({
      where: { id: betSlipId },
      include: WITH_SELECTIONS,
    });
    return mapBetSlip(raw);
  }

  async clear(id: string, _userId: string): Promise<BetSlipData> {
    await prisma.betSlipSelection.deleteMany({ where: { betSlipId: id } });
    const raw = await prisma.betSlip.update({
      where: { id },
      data: { totalStake: 0, totalOdds: 1, potentialPayout: 0 },
      include: WITH_SELECTIONS,
    });
    return mapBetSlip(raw);
  }
}
