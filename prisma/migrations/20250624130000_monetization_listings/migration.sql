-- AlterTable
ALTER TABLE "Tool" ADD COLUMN "sponsored" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sponsoredUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Tool_sponsored_idx" ON "Tool"("sponsored");
CREATE INDEX "Tool_sponsoredUntil_idx" ON "Tool"("sponsoredUntil");
