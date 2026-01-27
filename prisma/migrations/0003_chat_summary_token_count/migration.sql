-- AlterTable
ALTER TABLE "Message" ADD COLUMN "tokenCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ChatSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "summaryText" TEXT NOT NULL,
    "summaryVersion" INTEGER NOT NULL DEFAULT 1,
    "summarizedUpToMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatSummary_userId_chatId_key" ON "ChatSummary"("userId", "chatId");

-- AddForeignKey
ALTER TABLE "ChatSummary" ADD CONSTRAINT "ChatSummary_userId_chatId_fkey" FOREIGN KEY ("userId", "chatId") REFERENCES "ChatSession"("userId", "chatId") ON DELETE CASCADE ON UPDATE CASCADE;
