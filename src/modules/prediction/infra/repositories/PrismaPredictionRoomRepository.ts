import { Prisma } from '@prisma/client';
import { prisma } from '../../../../shared/infra/database/prisma';
import {
  IPredictionRoomRepository,
  PredictionRoomData,
  PredictionRoomPlayerData,
  PredictionEventData,
  PredictionOptionData,
  UserPredictionData,
  CreatePredictionRoomInput,
  SubmitPredictionsInput,
  FinishPredictionRoomInput,
  PredictionRoomStatus,
} from '../../domain/repositories/IPredictionRoomRepository';

const PLATFORM_FEE_RATE = 0.05;

function toNumber(d: Prisma.Decimal | number | null | undefined): number {
  if (d === null || d === undefined) return 0;
  return typeof d === 'number' ? d : Number(d.toString());
}

function mapOption(o: { id: string; eventId: string; label: string; sortOrder: number }): PredictionOptionData {
  return { id: o.id, eventId: o.eventId, label: o.label, sortOrder: o.sortOrder };
}

function mapPrediction(p: {
  id: string; playerId: string; eventId: string; optionId: string; isCorrect: boolean | null; createdAt: Date;
}): UserPredictionData {
  return { id: p.id, playerId: p.playerId, eventId: p.eventId, optionId: p.optionId, isCorrect: p.isCorrect, createdAt: p.createdAt };
}

function mapEvent(e: {
  id: string; roomId: string; title: string; description: string | null;
  sortOrder: number; correctOptionId: string | null; createdAt: Date;
  options: Array<{ id: string; eventId: string; label: string; sortOrder: number }>;
}): PredictionEventData {
  return {
    id: e.id, roomId: e.roomId, title: e.title, description: e.description,
    sortOrder: e.sortOrder, correctOptionId: e.correctOptionId, createdAt: e.createdAt,
    options: e.options.map(mapOption),
  };
}

function mapPlayer(p: {
  id: string; roomId: string; userId: string; isBot: boolean; displayName: string | null;
  status: string; score: number; position: number | null; joinedAt: Date;
  predictions: Array<{ id: string; playerId: string; eventId: string; optionId: string; isCorrect: boolean | null; createdAt: Date }>;
}): PredictionRoomPlayerData {
  return {
    id: p.id, roomId: p.roomId, userId: p.userId, isBot: p.isBot,
    displayName: p.displayName, status: p.status as any,
    score: p.score, position: p.position, joinedAt: p.joinedAt,
    predictions: p.predictions.map(mapPrediction),
  };
}

function mapRoom(r: {
  id: string; hostId: string; title: string; entryAmount: Prisma.Decimal;
  maxPlayers: number; status: string; predictionsDeadline: Date | null;
  prizePool: Prisma.Decimal; platformFee: Prisma.Decimal; winnerId: string | null;
  isSimulation: boolean; createdAt: Date; updatedAt: Date;
  players: Array<{
    id: string; roomId: string; userId: string; isBot: boolean; displayName: string | null;
    status: string; score: number; position: number | null; joinedAt: Date;
    predictions: Array<{ id: string; playerId: string; eventId: string; optionId: string; isCorrect: boolean | null; createdAt: Date }>;
  }>;
  events: Array<{
    id: string; roomId: string; title: string; description: string | null;
    sortOrder: number; correctOptionId: string | null; createdAt: Date;
    options: Array<{ id: string; eventId: string; label: string; sortOrder: number }>;
  }>;
}): PredictionRoomData {
  return {
    id: r.id, hostId: r.hostId, title: r.title,
    entryAmount: toNumber(r.entryAmount), maxPlayers: r.maxPlayers,
    status: r.status as PredictionRoomStatus,
    predictionsDeadline: r.predictionsDeadline,
    prizePool: toNumber(r.prizePool), platformFee: toNumber(r.platformFee),
    winnerId: r.winnerId, isSimulation: r.isSimulation,
    createdAt: r.createdAt, updatedAt: r.updatedAt,
    players: r.players.map(mapPlayer),
    events: r.events.map(mapEvent),
  };
}

const WITH_FULL = {
  players: {
    orderBy: { joinedAt: 'asc' as const },
    include: { predictions: { orderBy: { createdAt: 'asc' as const } } },
  },
  events: {
    orderBy: { sortOrder: 'asc' as const },
    include: { options: { orderBy: { sortOrder: 'asc' as const } } },
  },
};

export class PrismaPredictionRoomRepository implements IPredictionRoomRepository {
  async create(input: CreatePredictionRoomInput): Promise<PredictionRoomData> {
    const room = await prisma.predictionRoom.create({
      data: {
        hostId: input.hostId,
        title: input.title,
        entryAmount: input.entryAmount,
        maxPlayers: input.maxPlayers,
        predictionsDeadline: input.predictionsDeadline,
        isSimulation: input.isSimulation ?? false,
        events: {
          create: input.events.map((e) => ({
            title: e.title,
            description: e.description,
            sortOrder: e.sortOrder,
            options: { create: e.options.map((o) => ({ label: o.label, sortOrder: o.sortOrder })) },
          })),
        },
      },
      include: WITH_FULL,
    });
    return mapRoom(room as any);
  }

  async findById(id: string): Promise<PredictionRoomData | null> {
    const room = await prisma.predictionRoom.findUnique({ where: { id }, include: WITH_FULL });
    if (!room) return null;
    return mapRoom(room as any);
  }

  async findAll(status?: PredictionRoomStatus): Promise<PredictionRoomData[]> {
    const rooms = await prisma.predictionRoom.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: WITH_FULL,
    });
    return rooms.map((r) => mapRoom(r as any));
  }

  async addPlayer(roomId: string, userId: string): Promise<PredictionRoomData> {
    // Update prize pool
    const room = await prisma.predictionRoom.findUnique({ where: { id: roomId }, include: WITH_FULL });
    if (!room) throw new Error('Room not found');

    const newPrizePool = toNumber(room.prizePool) + toNumber(room.entryAmount);
    const platformFee = newPrizePool * PLATFORM_FEE_RATE;

    await prisma.predictionRoom.update({
      where: { id: roomId },
      data: { prizePool: newPrizePool, platformFee },
    });

    await prisma.predictionRoomPlayer.create({
      data: { roomId, userId },
    });

    const updated = await prisma.predictionRoom.findUnique({ where: { id: roomId }, include: WITH_FULL });
    return mapRoom(updated as any);
  }

  async start(id: string): Promise<PredictionRoomData> {
    const room = await prisma.predictionRoom.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: WITH_FULL,
    });
    return mapRoom(room as any);
  }

  async submitPredictions(input: SubmitPredictionsInput): Promise<PredictionRoomPlayerData> {
    const { playerId, predictions } = input;

    // Upsert each prediction
    for (const pred of predictions) {
      await prisma.userPrediction.upsert({
        where: { playerId_eventId: { playerId, eventId: pred.eventId } },
        create: { playerId, eventId: pred.eventId, optionId: pred.optionId },
        update: { optionId: pred.optionId },
      });
    }

    // Fetch player + room to know total events
    const player = await prisma.predictionRoomPlayer.findUnique({
      where: { id: playerId },
      include: {
        predictions: true,
        room: { include: { events: true } },
      },
    });
    if (!player) throw new Error('Player not found');

    const totalEvents = player.room.events.length;
    const submittedCount = player.predictions.length + predictions.length - new Set([...player.predictions.map((p) => p.eventId), ...predictions.map((p) => p.eventId)]).size + predictions.length;

    // Recalculate after upsert
    const freshPlayer = await prisma.predictionRoomPlayer.findUnique({
      where: { id: playerId },
      include: { predictions: { orderBy: { createdAt: 'asc' } } },
    });

    const newStatus = freshPlayer!.predictions.length >= totalEvents ? 'READY' : 'PREDICTING';
    const updated = await prisma.predictionRoomPlayer.update({
      where: { id: playerId },
      data: { status: newStatus },
      include: { predictions: { orderBy: { createdAt: 'asc' } } },
    });

    return mapPlayer(updated as any);
  }

  async finish(input: FinishPredictionRoomInput): Promise<PredictionRoomData> {
    const { roomId, correctOptions, entryAmount, isSimulation } = input;

    // Set correct option on each event
    for (const co of correctOptions) {
      await prisma.predictionEvent.update({
        where: { id: co.eventId },
        data: { correctOptionId: co.optionId },
      });
    }

    // Mark predictions as correct/incorrect
    const correctOptionMap = new Map(correctOptions.map((co) => [co.eventId, co.optionId]));
    const allPredictions = await prisma.userPrediction.findMany({
      where: { event: { roomId } },
    });
    for (const pred of allPredictions) {
      const correct = correctOptionMap.get(pred.eventId) === pred.optionId;
      await prisma.userPrediction.update({ where: { id: pred.id }, data: { isCorrect: correct } });
    }

    // Calculate scores per player
    const players = await prisma.predictionRoomPlayer.findMany({
      where: { roomId },
      include: { predictions: true },
    });

    const scored = players.map((p) => ({
      id: p.id,
      userId: p.userId,
      isBot: p.isBot,
      score: p.predictions.filter((pred) => correctOptionMap.get(pred.eventId) === pred.optionId).length,
      joinedAt: p.joinedAt,
    }));

    // Sort by score desc, then joinedAt asc (tiebreak: earliest to submit = higher rank)
    scored.sort((a, b) => b.score - a.score || a.joinedAt.getTime() - b.joinedAt.getTime());

    const winnerId = scored[0]?.userId ?? null;
    const room = await prisma.predictionRoom.findUnique({ where: { id: roomId } });
    const prizePool = toNumber(room!.prizePool);
    const platformFee = prizePool * PLATFORM_FEE_RATE;
    const winnerPrize = prizePool * (1 - PLATFORM_FEE_RATE);

    // Update positions
    for (let i = 0; i < scored.length; i++) {
      await prisma.predictionRoomPlayer.update({
        where: { id: scored[i].id },
        data: { score: scored[i].score, position: i + 1 },
      });
    }

    // Credit winner (skip for bots + skip in simulation)
    if (!isSimulation && winnerId) {
      const winner = scored.find((p) => p.userId === winnerId);
      if (winner && !winner.isBot) {
        await this.creditBalance(winnerId, winnerPrize);
      }
    }

    const finished = await prisma.predictionRoom.update({
      where: { id: roomId },
      data: { status: 'FINISHED', winnerId, platformFee },
      include: WITH_FULL,
    });

    return mapRoom(finished as any);
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    return wallet ? toNumber(wallet.balanceAmount) : 0;
  }

  async deductBalance(userId: string, amount: number): Promise<void> {
    await prisma.wallet.update({
      where: { userId },
      data: { balanceAmount: { decrement: amount } },
    });
  }

  async creditBalance(userId: string, amount: number): Promise<void> {
    await prisma.wallet.update({
      where: { userId },
      data: { balanceAmount: { increment: amount } },
    });
  }
}
