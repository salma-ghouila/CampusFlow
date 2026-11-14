-- DropIndex
DROP INDEX "Subject_programId_name_key";

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "ownerId" TEXT,
ALTER COLUMN "programId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Subject_ownerId_idx" ON "Subject"("ownerId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
