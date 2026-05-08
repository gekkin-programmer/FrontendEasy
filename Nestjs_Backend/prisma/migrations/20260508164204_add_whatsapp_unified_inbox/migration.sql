-- CreateEnum
CREATE TYPE "InboxPlatform" AS ENUM ('WHATSAPP', 'INSTAGRAM_DM', 'FACEBOOK_DM');

-- CreateEnum
CREATE TYPE "InboxMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateTable
CREATE TABLE "whatsapp_connections" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "wabaId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "displayName" TEXT,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "webhookVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox_conversations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "platform" "InboxPlatform" NOT NULL,
    "externalId" TEXT NOT NULL,
    "participantName" TEXT,
    "participantId" TEXT,
    "participantAvatar" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbox_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "externalId" TEXT,
    "direction" "InboxMessageDirection" NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbox_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_connections_workspaceId_key" ON "whatsapp_connections"("workspaceId");

-- CreateIndex
CREATE INDEX "inbox_conversations_workspaceId_lastMessageAt_idx" ON "inbox_conversations"("workspaceId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "inbox_conversations_workspaceId_platform_externalId_key" ON "inbox_conversations"("workspaceId", "platform", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "inbox_messages_externalId_key" ON "inbox_messages"("externalId");

-- CreateIndex
CREATE INDEX "inbox_messages_conversationId_sentAt_idx" ON "inbox_messages"("conversationId", "sentAt");

-- AddForeignKey
ALTER TABLE "whatsapp_connections" ADD CONSTRAINT "whatsapp_connections_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_conversations" ADD CONSTRAINT "inbox_conversations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "inbox_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
