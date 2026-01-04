/*
  Warnings:

  - You are about to drop the column `engagementRate` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `totalClicks` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `totalComments` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `totalLikes` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `totalShares` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `totalViews` on the `posts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('ORANGE_MONEY', 'MTN_MOMO', 'WAVE', 'STRIPE', 'CASH');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "AiTone" AS ENUM ('PROFESSIONAL', 'CASUAL', 'NOUCHI', 'CAMFRANGLAIS', 'PIDGIN');

-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'AUDIO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LEAD_CAPTURED';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_RECEIVED';

-- AlterEnum
ALTER TYPE "PostStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterEnum
ALTER TYPE "SocialPlatform" ADD VALUE 'WHATSAPP';

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "engagementRate",
DROP COLUMN "totalClicks",
DROP COLUMN "totalComments",
DROP COLUMN "totalLikes",
DROP COLUMN "totalShares",
DROP COLUMN "totalViews";

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "defaultTone" "AiTone" DEFAULT 'PROFESSIONAL';

-- CreateTable
CREATE TABLE "media_library" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "aiDescription" TEXT,
    "aiTags" TEXT[],
    "folder" TEXT DEFAULT 'root',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_media" (
    "postId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "post_media_pkey" PRIMARY KEY ("postId","mediaId")
);

-- CreateTable
CREATE TABLE "external_reviews" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "reviewerName" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "feedback" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_links" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'ORANGE_MONEY',
    "description" TEXT,
    "urlSlug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "platform" "SocialPlatform",
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[],
    "replyType" TEXT NOT NULL,
    "publicReply" TEXT,
    "privateMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_reviews_token_key" ON "external_reviews"("token");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_urlSlug_key" ON "payment_links"("urlSlug");

-- CreateIndex
CREATE UNIQUE INDEX "leads_workspaceId_phone_key" ON "leads"("workspaceId", "phone");

-- CreateIndex
CREATE INDEX "posts_status_scheduledFor_idx" ON "posts"("status", "scheduledFor");

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_reviews" ADD CONSTRAINT "external_reviews_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
