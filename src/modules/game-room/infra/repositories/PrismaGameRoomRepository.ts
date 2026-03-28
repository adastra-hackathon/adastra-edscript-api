import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { prisma } from '../../../../shared/infra/database/prisma';
import {
  IGameRoomRepository,
  GameRoomData,
  GameRoomPlayerData,
  GameRoomVoucherData,
  CreateGameRoomInput,
  FinishGameRoomInput,
  AddBotsInput,
  GameRoomStatus,
} from '../../domain/repositories/IGameRoomRepository';

const BOT_NAMES = ['Alice Bot', 'Bruno Bot', 'Carlos Bot', 'Diana Bot', 'Eduardo Bot', 'Fernanda Bot', 'Gabriel Bot', 'Helena Bot'];

function toNumber(d: Prisma.Decimal | number | null | undefined): number {
  if (d === null || d === undefined) return 0;
  return typeof d === 'number' ? d : Number(d.toString());
}

function mapPlayer(p: {
  id: string; roomId: string; userId: string; isBot: boolean; displayName: string | null;
  initialBalance: Prisma.Decimal; finalBalance: Prisma.Decimal | null;
  profit: Prisma.Decimal | null; position: number | null; joinedAt: Date;
}): GameRoomPlayerData {
  return {
    id: p.id,
    roomId: p.roomId,
    userId: p.userId,
    isBot: p.isBot,
    displayName: p.displayName,
    initialBalance: toNumber(p.initialBalance),
    finalBalance: p.finalBalance !== null ? toNumber(p.finalBalance) : null,
    profit: p.profit !== null ? toNumber(p.profit) : null,
    position: p.position,
    joinedAt: p.joinedAt,
  };
}

function mapRoom(r: {
  id: string; hostId: string; gameId: string; entryAmount: Prisma.Decimal;
  maxPlayers: number; status: string; startAt: Date | null; duration: number;
  prizePool: Prisma.Decimal; platformFee: Prisma.Decimal; winnerId: string | null;
  isSimulation: boolean; createdAt: Date; updatedAt: Date;
  players: Array<{
    id: string; roomId: string; userId: string; isBot: boolean; displayName: string | null;
    initialBalance: Prisma.Decimal; finalBalance: Prisma.Decimal | null;
    profit: Prisma.Decimal | null; position: number | null; joinedAt: Date;
  }>;
}): GameRoomData {
  return {
    id: r.id,
    hostId: r.hostId,
    gameId: r.gameId,
    entryAmount: toNumber(r.entryAmount),
    maxPlayers: r.maxPlayers,
    status: r.status as GameRoomStatus,
    startAt: r.startAt,
    duration: r.duration,
    prizePool: toNumber(r.prizePool),
    platformFee: toNumber(r.platformFee),
    winnerId: r.winnerId,
    isSimulation: r.isSimulation,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    players: r.players.map(mapPlayer),
  };
}

const WITH_PLAYERS = { players: { orderBy: { joinedAt: 'asc' as const } } };

export class PrismaGameRoomRepository implements IGameRoomRepository {
  async create(input: CreateGameRoomInput): Promise<GameRoomData> {
    const room = await prisma.gameRoom.create({
      data: {
        hostId: input.hostId,
        gameId: input.gameId,
        entryAmount: input.entryAmount,
        maxPlayers: input.maxPlayers,
        startAt: input.startAt,
        duration: input.duration,
        isSimulation: input.isSimulation ?? false,
      },
      include: WITH_PLAYERS,
    });
    return mapRoom(room);
  }

  async findById(id: string): Promise<GameRoomData | null> {
    const room = await prisma.gameRoom.findUnique({ where: { id }, include: WITH_PLAYERS });
    if (!room) return null;
    return mapRoom(room);
  }

  async findAll(status?: GameRoomStatus): Promise<GameRoomData[]> {
    const rooms = await prisma.gameRoom.findMany({
      where: status ? { status } : undefined,
      include: WITH_PLAYERS,
      orderBy: { createdAt: 'desc' },
    });
    return rooms.map(mapRoom);
  }

  async addPlayer(roomId: string, userId: string, initialBalance: number): Promise<GameRoomData> {
    await prisma.$transaction(async (tx) => {
      await tx.gameRoomPlayer.create({
        data: { roomId, userId, initialBalance },
      });
      const room = await tx.gameRoom.findUniqueOrThrow({ where: { id: roomId } });
      await tx.gameRoom.update({
        where: { id: roomId },
        data: { prizePool: { increment: room.entryAmount } },
      });
    });
    return (await this.findById(roomId))!;
  }

  async addBots(input: AddBotsInput): Promise<GameRoomData> {
    const { roomId, count, initialBalance } = input;

    await prisma.$transaction(async (tx) => {
      const room = await tx.gameRoom.findUniqueOrThrow({ where: { id: roomId } });
      const usedNames = await tx.gameRoomPlayer
        .findMany({ where: { roomId, isBot: true }, select: { displayName: true } })
        .then((ps) => new Set(ps.map((p) => p.displayName)));

      const availableNames = BOT_NAMES.filter((n) => !usedNames.has(n));

      for (let i = 0; i < count; i++) {
        const displayName = availableNames[i] ?? `Bot ${i + 1}`;
        const botUserId = `bot-${randomUUID()}`;
        await tx.gameRoomPlayer.create({
          data: {
            roomId,
            userId: botUserId,
            isBot: true,
            displayName,
            initialBalance,
          },
        });
        await tx.gameRoom.update({
          where: { id: roomId },
          data: { prizePool: { increment: room.entryAmount } },
        });
      }
    });

    return (await this.findById(roomId))!;
  }

  async start(id: string, startAt: Date): Promise<GameRoomData> {
    const room = await prisma.gameRoom.update({
      where: { id },
      data: { status: 'IN_PROGRESS', startAt },
      include: WITH_PLAYERS,
    });
    return mapRoom(room);
  }

  async finish(input: FinishGameRoomInput): Promise<GameRoomData> {
    const { roomId, results, winnerId, lastPlaceUserId, entryAmount, isSimulation } = input;

    const room = await prisma.gameRoom.findUniqueOrThrow({ where: { id: roomId } });
    const prizePool = toNumber(room.prizePool);
    const winnerPrize = Number((prizePool * 0.99).toFixed(2));
    const platformFee = Number((prizePool * 0.01).toFixed(2));

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.$transaction(async (tx) => {
      await tx.gameRoom.update({
        where: { id: roomId },
        data: { status: 'FINISHED', winnerId, platformFee },
      });

      for (const result of results) {
        const player = await tx.gameRoomPlayer.findFirst({ where: { roomId, userId: result.userId } });
        if (player) {
          const profit = result.finalBalance - toNumber(player.initialBalance);
          await tx.gameRoomPlayer.update({
            where: { id: player.id },
            data: { finalBalance: result.finalBalance, profit, position: result.position },
          });
        }
      }

      // Skip wallet/voucher operations for simulation mode
      if (!isSimulation) {
        const winnerPlayer = await tx.gameRoomPlayer.findFirst({ where: { roomId, userId: winnerId } });
        if (winnerPlayer && !winnerPlayer.isBot) {
          await tx.wallet.update({
            where: { userId: winnerId },
            data: { balanceAmount: { increment: winnerPrize } },
          });
        }

        const lastPlayer = await tx.gameRoomPlayer.findFirst({ where: { roomId, userId: lastPlaceUserId } });
        if (lastPlayer && !lastPlayer.isBot) {
          await tx.gameRoomVoucher.create({
            data: { userId: lastPlaceUserId, roomId, amount: entryAmount, expiresAt },
          });
        }
      } else {
        // Simulation: credit only real winner if exists
        const winnerPlayer = await tx.gameRoomPlayer.findFirst({ where: { roomId, userId: winnerId } });
        if (winnerPlayer && !winnerPlayer.isBot) {
          await tx.wallet.update({
            where: { userId: winnerId },
            data: { balanceAmount: { increment: winnerPrize } },
          });
        }
      }
    });

    return (await this.findById(roomId))!;
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    return toNumber(wallet?.balanceAmount);
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

  async createVoucher(userId: string, roomId: string, amount: number, expiresAt: Date): Promise<GameRoomVoucherData> {
    const voucher = await prisma.gameRoomVoucher.create({
      data: { userId, roomId, amount, expiresAt },
    });
    return {
      id: voucher.id,
      userId: voucher.userId,
      roomId: voucher.roomId,
      amount: toNumber(voucher.amount),
      expiresAt: voucher.expiresAt,
      usedAt: voucher.usedAt,
      createdAt: voucher.createdAt,
    };
  }
}
