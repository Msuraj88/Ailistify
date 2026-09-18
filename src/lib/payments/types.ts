import type { ListingPlan, PromotionPlan } from "@/generated/prisma/client";

export type PaymentProviderId = "dodo";

export type PaidListingPlan = Extract<ListingPlan, "PRIORITY" | "FEATURED">;

export type PromotePlan = PromotionPlan;

export type CreateCheckoutInput = {
  toolId?: string;
  submissionId: string;
  productId: string;
  amount: number;
  currency?: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  payerEmail?: string | null;
  payerName?: string | null;
  metadata?: Record<string, string>;
};

export type CreateCheckoutResult = {
  paymentId: string;
  providerOrderId: string;
  approvalUrl: string;
};

export type CaptureCheckoutResult = {
  paymentId: string;
  submissionId: string;
  toolId: string | null;
  promotionId: string | null;
  providerOrderId: string;
  providerCaptureId: string | null;
  amount: number;
  currency: string;
  status: "PAID";
  payerEmail: string | null;
  payerName: string | null;
  country: string | null;
  alreadyCaptured: boolean;
};

export type ProviderPayment = {
  providerPaymentId: string;
  status: string;
  amount: number;
  currency: string;
  payerEmail: string | null;
  payerName: string | null;
  country: string | null;
  metadata: Record<string, string>;
  raw: unknown;
};

export type PaymentProvider = {
  id: PaymentProviderId;
  createCheckoutSession(input: CreateCheckoutInput): Promise<{
    providerOrderId: string;
    approvalUrl: string;
    raw: unknown;
  }>;
  getPayment(providerPaymentId: string): Promise<ProviderPayment>;
  verifyAndParseWebhook?(
    headers: Headers,
    body: string,
  ): Promise<{ ok: boolean; eventType?: string; data?: unknown }>;
};

export type PaymentEventType =
  | "PAYMENT_STARTED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_CAPTURED"
  | "PAYMENT_FAILED"
  | "PAYMENT_CANCELLED"
  | "PAYMENT_REFUNDED";
