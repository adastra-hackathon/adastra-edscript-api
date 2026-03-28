-- CreateEnum
CREATE TYPE "GameRoomStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "game_rooms" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "entryAmount" DECIMAL(18,2) NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 10,
    "status" "GameRoomStatus" NOT NULL DEFAULT 'WAITING',
    "startAt" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 300,
    "prizePool" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_room_players" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "initialBalance" DECIMAL(18,2) NOT NULL,
    "finalBalance" DECIMAL(18,2),
    "profit" DECIMAL(18,2),
    "position" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_room_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_room_vouchers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_room_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_room_players_roomId_userId_key" ON "game_room_players"("roomId", "userId");

-- AddForeignKey
ALTER TABLE "game_rooms" ADD CONSTRAINT "game_rooms_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rooms" ADD CONSTRAINT "game_rooms_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rooms" ADD CONSTRAINT "game_rooms_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_room_players" ADD CONSTRAINT "game_room_players_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "game_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_room_players" ADD CONSTRAINT "game_room_players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_room_vouchers" ADD CONSTRAINT "game_room_vouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_room_vouchers" ADD CONSTRAINT "game_room_vouchers_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "game_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
