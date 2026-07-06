export const PRICING_MODELS = [
  "FREE",
  "FREEMIUM",
  "PAID",
  "SUBSCRIPTION",
  "CONTACT",
] as const;

/** Options shown in the admin tool form pricing dropdown. */
export const ADMIN_TOOL_PRICING_MODELS = ["FREE", "FREEMIUM", "PAID"] as const;

export const TOOL_STATUSES = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
] as const;

export type PricingModelValue = (typeof PRICING_MODELS)[number];
export type ToolStatusValue = (typeof TOOL_STATUSES)[number];

export const LISTING_PLANS = ["FREE", "PRIORITY", "FEATURED"] as const;
export type ListingPlanValue = (typeof LISTING_PLANS)[number];

export const PAYMENT_STATUSES = [
  "NOT_REQUIRED",
  "PENDING",
  "PAID",
  "CANCELLED",
] as const;
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

export const SUBMIT_PLAN_PRICES = {
  PRIORITY: 19,
  FEATURED: 49,
} as const;

export const FREE_QUEUE_STATS = {
  waitingCount: 455,
  reviewDaysMin: 45,
  reviewDaysMax: 60,
} as const;
