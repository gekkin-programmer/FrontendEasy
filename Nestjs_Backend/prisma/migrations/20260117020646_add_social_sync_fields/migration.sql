/*
  Warnings:

  - A unique constraint covering the columns `[socialAccountId,externalId]` on the table `posts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "metaData" JSONB,
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "platform" "SocialPlatform";

-- CreateIndex
CREATE UNIQUE INDEX "posts_socialAccountId_externalId_key" ON "posts"("socialAccountId", "externalId");
