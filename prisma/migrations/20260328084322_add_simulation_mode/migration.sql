-- AlterTable
ALTER TABLE "game_room_players" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "game_rooms" ADD COLUMN     "isSimulation" BOOLEAN NOT NULL DEFAULT false;
