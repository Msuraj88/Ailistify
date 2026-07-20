-- CreateEnum
CREATE TYPE "PromotionPlan" AS ENUM ('HOMEPAGE_SPONSOR', 'FEATURED_LISTING');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "promotionId" TEXT;

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "plan" "PromotionPlan" NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "toolUrl" TEXT NOT NULL,
    "status" "PromotionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_referenceId_key" ON "Promotion"("referenceId");

-- CreateIndex
CREATE INDEX "Promotion_status_idx" ON "Promotion"("status");

-- CreateIndex
CREATE INDEX "Promotion_plan_idx" ON "Promotion"("plan");

-- CreateIndex
CREATE INDEX "Promotion_contactEmail_idx" ON "Promotion"("contactEmail");

-- CreateIndex
CREATE INDEX "Promotion_createdAt_idx" ON "Promotion"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Promotion_paidAt_idx" ON "Promotion"("paidAt");

-- CreateIndex
CREATE INDEX "Payment_promotionId_idx" ON "Payment"("promotionId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
