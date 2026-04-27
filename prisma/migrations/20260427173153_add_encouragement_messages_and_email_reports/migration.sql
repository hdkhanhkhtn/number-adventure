-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "emailReports" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "EncouragementMessage" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncouragementMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EncouragementMessage_childId_createdAt_idx" ON "EncouragementMessage"("childId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "EncouragementMessage" ADD CONSTRAINT "EncouragementMessage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncouragementMessage" ADD CONSTRAINT "EncouragementMessage_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
