-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "lastLoginAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "reported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supportRequested" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserQuota" (
    "userId" TEXT NOT NULL,
    "monthlyQuota" INTEGER NOT NULL,
    "monthlyUsed" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuota_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "ix_tokenusage_user_time" ON "TokenUsage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ix_tokenusage_chat_time" ON "TokenUsage"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "ix_tracking_user_time" ON "TrackingEvent"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserQuota" ADD CONSTRAINT "UserQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

