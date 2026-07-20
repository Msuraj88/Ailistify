-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'FAILED';

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PaymentProvider" AS ENUM ('PAYPAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "GatewayPaymentStatus" AS ENUM ('CREATED', 'APPROVED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethodType" AS ENUM ('PAYPAL', 'CARD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "toolId" TEXT,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'PAYPAL',
    "providerOrderId" TEXT,
    "providerCaptureId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "GatewayPaymentStatus" NOT NULL DEFAULT 'CREATED',
    "paymentMethod" "PaymentMethodType",
    "payerEmail" VARCHAR(255),
    "payerName" VARCHAR(255),
    "country" VARCHAR(2),
    "gatewayResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "refundAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PaymentEvent" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_providerOrderId_key" ON "Payment"("providerOrderId");
CREATE INDEX IF NOT EXISTS "Payment_submissionId_idx" ON "Payment"("submissionId");
CREATE INDEX IF NOT EXISTS "Payment_toolId_idx" ON "Payment"("toolId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Payment_provider_status_idx" ON "Payment"("provider", "status");
CREATE INDEX IF NOT EXISTS "Payment_paidAt_idx" ON "Payment"("paidAt");
CREATE INDEX IF NOT EXISTS "PaymentEvent_paymentId_createdAt_idx" ON "PaymentEvent"("paymentId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "PaymentEvent_type_idx" ON "PaymentEvent"("type");

DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
