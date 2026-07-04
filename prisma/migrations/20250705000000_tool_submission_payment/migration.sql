-- CreateEnum
CREATE TYPE "ListingPlan" AS ENUM ('FREE', 'PRIORITY', 'FEATURED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN "listingPlan" "ListingPlan" NOT NULL DEFAULT 'FREE';
ALTER TABLE "Tool" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED';
ALTER TABLE "Tool" ADD COLUMN "submissionId" TEXT;
ALTER TABLE "Tool" ADD COLUMN "paypalOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tool_submissionId_key" ON "Tool"("submissionId");
CREATE INDEX "Tool_listingPlan_idx" ON "Tool"("listingPlan");
CREATE INDEX "Tool_paymentStatus_idx" ON "Tool"("paymentStatus");
