-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('SYSTEM', 'CORE', 'ROUTER', 'MODULE');

-- CreateTable
CREATE TABLE "PromptConfig" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PromptType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptConfig_slug_key" ON "PromptConfig"("slug");
