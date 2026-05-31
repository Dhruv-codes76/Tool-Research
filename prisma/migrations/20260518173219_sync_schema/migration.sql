/*
  Warnings:

  - You are about to drop the column `category` on the `Tool` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ToolType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PlatformToTool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PlatformToTool_A_fkey" FOREIGN KEY ("A") REFERENCES "Platform" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlatformToTool_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ToolToToolType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ToolToToolType_A_fkey" FOREIGN KEY ("A") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ToolToToolType_B_fkey" FOREIGN KEY ("B") REFERENCES "ToolType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "issues" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "lastFetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Tool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tool" ("createdAt", "description", "forks", "id", "imageUrl", "issues", "lastUpdate", "name", "published", "repoUrl", "stars", "updatedAt", "userId") SELECT "createdAt", "description", "forks", "id", "imageUrl", "issues", "lastUpdate", "name", "published", "repoUrl", "stars", "updatedAt", "userId" FROM "Tool";
DROP TABLE "Tool";
ALTER TABLE "new_Tool" RENAME TO "Tool";
CREATE UNIQUE INDEX "Tool_repoUrl_key" ON "Tool"("repoUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ToolType_name_key" ON "ToolType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PlatformToTool_AB_unique" ON "_PlatformToTool"("A", "B");

-- CreateIndex
CREATE INDEX "_PlatformToTool_B_index" ON "_PlatformToTool"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ToolToToolType_AB_unique" ON "_ToolToToolType"("A", "B");

-- CreateIndex
CREATE INDEX "_ToolToToolType_B_index" ON "_ToolToToolType"("B");
