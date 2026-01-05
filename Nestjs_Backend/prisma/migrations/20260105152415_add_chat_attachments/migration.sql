-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'AUDIO', 'IMAGE', 'FILE');

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT';
