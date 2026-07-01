-- DropIndex
DROP INDEX IF EXISTS "Tool_name_key";

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "slug" TEXT;
