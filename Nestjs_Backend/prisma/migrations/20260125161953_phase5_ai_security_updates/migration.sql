/*
  Warnings:

  - You are about to drop the column `externalId` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `metaData` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `metrics` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `platformData` on the `posts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `post_comments` will be added. If there are existing duplicate values, this will fail.

*/
CREATE EXTENSION IF NOT EXISTS vector;
-- DropForeignKey
ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_userId_fkey";

-- DropIndex
DROP INDEX "posts_socialAccountId_externalId_key";

-- AlterTable
ALTER TABLE "post_comments" ADD COLUMN     "authorAvatar" TEXT,
ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "isReply" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platform" "SocialPlatform",
ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'unread',
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "externalId",
DROP COLUMN "metaData",
DROP COLUMN "metrics",
DROP COLUMN "platform",
DROP COLUMN "platformData";

-- CreateTable
CREATE TABLE "easy_post_documents" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" vector(384),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "easy_post_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedbacks" (
    "id" TEXT NOT NULL,
    "aiMessageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedbackText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "easy_post_documents_id_idx" ON "easy_post_documents"("id");

-- CreateIndex
CREATE INDEX "easy_post_documents_workspaceId_idx" ON "easy_post_documents"("workspaceId");

-- CreateIndex
CREATE INDEX "ai_usage_logs_workspaceId_idx" ON "ai_usage_logs"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "post_comments_externalId_key" ON "post_comments"("externalId");

-- AddForeignKey
ALTER TABLE "easy_post_documents" ADD CONSTRAINT "easy_post_documents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
