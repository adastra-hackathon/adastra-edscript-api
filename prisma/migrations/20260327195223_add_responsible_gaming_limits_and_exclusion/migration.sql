-- CreateEnum
CREATE TYPE "GamingLimitType" AS ENUM ('BET_AMOUNT', 'DEPOSIT_AMOUNT', 'TIME_ON_SITE');

-- CreateEnum
CREATE TYPE "ExclusionType" AS ENUM ('TIMED', 'AUTO');

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "gender" TEXT;

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "emailOnDeposit" BOOLEAN NOT NULL DEFAULT true,
    "emailOnWithdrawal" BOOLEAN NOT NULL DEFAULT true,
    "checkIntervalMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_gaming_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "GamingLimitType" NOT NULL,
    "dailyLimit" DECIMAL(18,2),
    "weeklyLimit" DECIMAL(18,2),
    "monthlyLimit" DECIMAL(18,2),
    "reason" TEXT,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_gaming_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_exclusions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ExclusionType" NOT NULL,
    "excludeUntil" TIMESTAMP(3),
    "autoPeriod" TEXT,
    "reason" TEXT,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_profileId_key" ON "user_notification_preferences"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "user_gaming_limits_userId_type_key" ON "user_gaming_limits"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "user_exclusions_userId_key" ON "user_exclusions"("userId");

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gaming_limits" ADD CONSTRAINT "user_gaming_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exclusions" ADD CONSTRAINT "user_exclusions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
