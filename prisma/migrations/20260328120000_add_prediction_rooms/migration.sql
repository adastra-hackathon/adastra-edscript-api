-- CreateEnum
CREATE TYPE "PredictionPlayerStatus" AS ENUM ('WAITING', 'PREDICTING', 'READY');

-- AlterTable: add hostedPredictionRooms relation on users (no column change needed, handled by FK on prediction_rooms)

-- CreateTable: prediction_rooms
CREATE TABLE "prediction_rooms" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "entryAmount" DECIMAL(18,2) NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 10,
    "status" "GameRoomStatus" NOT NULL DEFAULT 'WAITING',
    "predictionsDeadline" TIMESTAMP(3),
    "prizePool" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable: prediction_room_players
CREATE TABLE "prediction_room_players" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "status" "PredictionPlayerStatus" NOT NULL DEFAULT 'WAITING',
    "score" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_room_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable: prediction_events
CREATE TABLE "prediction_events" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "correctOptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: prediction_options
CREATE TABLE "prediction_options" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "prediction_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable: user_predictions
CREATE TABLE "user_predictions" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prediction_room_players_roomId_userId_key" ON "prediction_room_players"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_predictions_playerId_eventId_key" ON "user_predictions"("playerId", "eventId");

-- AddForeignKey
ALTER TABLE "prediction_rooms" ADD CONSTRAINT "prediction_rooms_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_room_players" ADD CONSTRAINT "prediction_room_players_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "prediction_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_events" ADD CONSTRAINT "prediction_events_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "prediction_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_options" ADD CONSTRAINT "prediction_options_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "prediction_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "prediction_room_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "prediction_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "prediction_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
