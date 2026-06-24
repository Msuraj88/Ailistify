export const PRICING_MODELS = [
  "FREE",
  "FREEMIUM",
  "PAID",
  "SUBSCRIPTION",
  "CONTACT",
] as const;

export const TOOL_STATUSES = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
] as const;

export type PricingModelValue = (typeof PRICING_MODELS)[number];
export type ToolStatusValue = (typeof TOOL_STATUSES)[number];
