-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "downloadAssets" TEXT DEFAULT '[]';

-- CreateTable
CREATE TABLE "ToolChange" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'CRON',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ToolChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolChange_status_idx" ON "ToolChange"("status");

-- CreateIndex
CREATE INDEX "ToolChange_toolId_idx" ON "ToolChange"("toolId");

-- AddForeignKey
ALTER TABLE "ToolChange" ADD CONSTRAINT "ToolChange_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
