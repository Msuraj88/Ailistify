import { absoluteUrl } from "@/lib/utils";
import type { PaidListingPlan, PromotePlan } from "@/lib/payments/types";
import {
  PROMOTE_PLAN_LABELS,
  PROMOTE_PLAN_PRICES,
  SUBMIT_PLAN_PRICES,
} from "@/lib/constants/tools";

export type DodoEnvironment = "test_mode" | "live_mode";

export function getDodoEnvironment(): DodoEnvironment {
  const value = (
    process.env.DODO_PAYMENTS_ENVIRONMENT ??
    process.env.DODO_PAYMENTS_ENV ??
    "test_mode"
  )
    .trim()
    .toLowerCase();

  return value === "live_mode" || value === "live" || value === "production"
    ? "live_mode"
    : "test_mode";
}

/** Client overlay SDK uses `test` | `live`. */
export function getDodoCheckoutMode(): "test" | "live" {
  return getDodoEnvironment() === "live_mode" ? "live" : "test";
}

export function getDodoApiKey(): string {
  const key = process.env.DODO_PAYMENTS_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Dodo Payments is not configured. Set DODO_PAYMENTS_API_KEY.",
    );
  }
  return key;
}

export function getDodoWebhookKey(): string | null {
  return (
    process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim() ||
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET?.trim() ||
    null
  );
}

export function isDodoConfigured(): boolean {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY?.trim());
}

export function getPlanAmount(plan: PaidListingPlan): number {
  return SUBMIT_PLAN_PRICES[plan];
}

export function getPlanLabel(plan: PaidListingPlan): string {
  return plan === "FEATURED" ? "Featured Listing" : "Priority Listing";
}

export function getPromotePlanAmount(plan: PromotePlan): number {
  return PROMOTE_PLAN_PRICES[plan];
}

export function getPromotePlanLabel(plan: PromotePlan): string {
  return PROMOTE_PLAN_LABELS[plan];
}

export function getDodoProductIdForListingPlan(plan: PaidListingPlan): string {
  const productId =
    plan === "FEATURED"
      ? process.env.DODO_PRODUCT_FEATURED?.trim()
      : process.env.DODO_PRODUCT_PRIORITY?.trim();

  if (!productId) {
    throw new Error(
      `Missing Dodo product ID for ${plan}. Set DODO_PRODUCT_${plan}.`,
    );
  }

  return productId;
}

export function getDodoProductIdForPromotePlan(plan: PromotePlan): string {
  const productId =
    plan === "HOMEPAGE_SPONSOR"
      ? process.env.DODO_PRODUCT_HOMEPAGE_SPONSOR?.trim()
      : process.env.DODO_PRODUCT_FEATURED_LISTING?.trim();

  if (!productId) {
    throw new Error(
      `Missing Dodo product ID for ${plan}. Set DODO_PRODUCT_${plan}.`,
    );
  }

  return productId;
}

export function buildPaymentReturnUrl(submissionId: string): string {
  return absoluteUrl(
    `/api/payments/dodo/return?submissionId=${encodeURIComponent(submissionId)}`,
  );
}

export function buildPaymentCancelUrl(submissionId: string): string {
  return absoluteUrl(
    `/payment/cancel?submissionId=${encodeURIComponent(submissionId)}`,
  );
}

export function buildPromotionReturnUrl(referenceId: string): string {
  return absoluteUrl(
    `/api/payments/dodo/return?promotionId=${encodeURIComponent(referenceId)}`,
  );
}

export function buildPromotionCancelUrl(referenceId: string): string {
  return absoluteUrl(
    `/payment/cancel?promotionId=${encodeURIComponent(referenceId)}`,
  );
}
