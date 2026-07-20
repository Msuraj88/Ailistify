import type { ListingPlan, PromotionPlan } from "@/generated/prisma/client";

export type PaymentProviderId = "paypal";

export type PaidListingPlan = Extract<ListingPlan, "PRIORITY" | "FEATURED">;

export type PromotePlan = PromotionPlan;

export type CreateCheckoutInput = {
  toolId?: string;
  submissionId: string;
  listingPlan?: PaidListingPlan;
  amount: number;
  currency?: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  payerEmail?: string | null;
};

export type CreateCheckoutResult = {
  paymentId: string;
  providerOrderId: string;
  approvalUrl: string;
};

export type CaptureCheckoutInput = {
  providerOrderId: string;
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

export type PaymentProvider = {
  id: PaymentProviderId;
  createOrder(input: CreateCheckoutInput): Promise<{
    providerOrderId: string;
    approvalUrl: string;
    raw: unknown;
  }>;
  captureOrder(providerOrderId: string): Promise<{
    providerOrderId: string;
    providerCaptureId: string | null;
    status: string;
    amount: number;
    currency: string;
    payerEmail: string | null;
    payerName: string | null;
    country: string | null;
    raw: unknown;
  }>;
  getOrder(providerOrderId: string): Promise<{
    providerOrderId: string;
    status: string;
    amount: number | null;
    currency: string | null;
    raw: unknown;
  }>;
  verifyWebhook?(headers: Headers, body: string): Promise<boolean>;
};

export type PaymentEventType =
  | "PAYMENT_STARTED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_CAPTURED"
  | "PAYMENT_FAILED"
  | "PAYMENT_CANCELLED"
  | "PAYMENT_REFUNDED";
