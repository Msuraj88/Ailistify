import type {
  GatewayPaymentStatus,
  ListingPlan,
  PaymentProvider,
  PromotionPlan,
} from "@/generated/prisma/client";
import { PROMOTE_PLAN_LABELS } from "@/lib/constants/tools";

export type AdminPaymentListItem = {
  id: string;
  submissionId: string;
  toolId: string | null;
  promotionId: string | null;
  toolName: string | null;
  userName: string | null;
  email: string | null;
  contactEmail: string | null;
  toolUrl: string | null;
  listingPlan: ListingPlan | null;
  promotionPlan: PromotionPlan | null;
  planLabel: string | null;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  paymentMethod: string | null;
  status: GatewayPaymentStatus;
  providerOrderId: string | null;
  providerCaptureId: string | null;
  createdAt: Date;
  paidAt: Date | null;
};

export type AdminPaymentDetail = AdminPaymentListItem & {
  payerEmail: string | null;
  payerName: string | null;
  country: string | null;
  gatewayResponse: unknown;
  refundAt: Date | null;
  events: Array<{
    id: string;
    type: string;
    message: string | null;
    createdAt: Date;
  }>;
};

export type AdminPaymentStats = {
  todayRevenue: number;
  monthlyRevenue: number;
  successful: number;
  pending: number;
  failed: number;
  cancelled: number;
  refunded: number;
  conversionRate: number;
  priorityCount: number;
  featuredCount: number;
  homepageSponsorCount: number;
  featuredListingCount: number;
};

export type AdminPaymentPlanFilter = ListingPlan | PromotionPlan | "ALL";

export type AdminPaymentFilters = {
  q?: string;
  status?: GatewayPaymentStatus | "ALL";
  plan?: AdminPaymentPlanFilter;
  range?: "today" | "week" | "month" | "year" | "custom" | "all";
  from?: string;
  to?: string;
};

export function formatAdminPaymentPlanLabel(
  listingPlan: ListingPlan | null,
  promotionPlan: PromotionPlan | null,
): string | null {
  if (promotionPlan) {
    return PROMOTE_PLAN_LABELS[promotionPlan];
  }
  return listingPlan;
}
