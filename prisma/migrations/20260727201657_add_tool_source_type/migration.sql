-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "sourceNote" TEXT,
ADD COLUMN     "sourceType" TEXT NOT NULL DEFAULT 'OPEN_SOURCE',
ALTER COLUMN "repoUrl" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Tool_sourceType_idx" ON "Tool"("sourceType");
