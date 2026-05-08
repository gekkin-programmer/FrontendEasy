-- CreateTable
CREATE TABLE "canva_connections" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "canvaUserId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canva_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "canva_connections_workspaceId_key" ON "canva_connections"("workspaceId");

-- AddForeignKey
ALTER TABLE "canva_connections" ADD CONSTRAINT "canva_connections_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
