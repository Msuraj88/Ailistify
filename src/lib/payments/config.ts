import { absoluteUrl } from "@/lib/utils";
import type { PaidListingPlan, PromotePlan } from "@/lib/payments/types";
import {
  PROMOTE_PLAN_LABELS,
  PROMOTE_PLAN_PRICES,
  SUBMIT_PLAN_PRICES,
} from "@/lib/constants/tools";

export function getPayPalEnvironment(): "sandbox" | "live" {
  const value = (
    process.env.PAYPAL_ENVIRONMENT ??
    process.env.PAYPAL_MODE ??
    "sandbox"
  )
    .trim()
    .toLowerCase();

  return value === "live" || value === "production" ? "live" : "sandbox";
}

export function getPayPalApiBase(): string {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
    );
  }

  return { clientId, clientSecret };
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() &&
    process.env.PAYPAL_CLIENT_SECRET?.trim(),
  );
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

export function getPayPalClientId(): string | null {
  return (
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ||
    process.env.PAYPAL_CLIENT_ID?.trim() ||
    null
  );
}

export function buildPaymentReturnUrl(submissionId: string): string {
  return absoluteUrl(
    `/api/payments/paypal/capture?submissionId=${encodeURIComponent(submissionId)}`,
  );
}

export function buildPaymentCancelUrl(submissionId: string): string {
  return absoluteUrl(
    `/payment/cancel?submissionId=${encodeURIComponent(submissionId)}`,
  );
}

export function buildPromotionReturnUrl(referenceId: string): string {
  return absoluteUrl(
    `/payment/success?promotionId=${encodeURIComponent(referenceId)}`,
  );
}

export function buildPromotionCancelUrl(referenceId: string): string {
  return absoluteUrl(
    `/payment/cancel?promotionId=${encodeURIComponent(referenceId)}`,
  );
}
