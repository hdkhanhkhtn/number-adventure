-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "description" TEXT,
ADD COLUMN     "objectives" JSONB,
ADD COLUMN     "passingStars" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionCount" INTEGER NOT NULL DEFAULT 8;

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_worldId_order_key" ON "Lesson"("worldId", "order");
