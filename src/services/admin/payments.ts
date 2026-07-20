import type {
  GatewayPaymentStatus,
  ListingPlan,
  Prisma,
  PromotionPlan,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AdminPaymentDetail,
  AdminPaymentFilters,
  AdminPaymentListItem,
  AdminPaymentStats,
} from "@/types/admin-payments";
import { formatAdminPaymentPlanLabel } from "@/types/admin-payments";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function rangeToDates(filters: AdminPaymentFilters): {
  gte?: Date;
  lte?: Date;
} {
  const now = new Date();

  if (filters.range === "custom") {
    return {
      gte: filters.from ? new Date(filters.from) : undefined,
      lte: filters.to ? new Date(filters.to) : undefined,
    };
  }

  if (filters.range === "today") {
    return { gte: startOfDay(now) };
  }

  if (filters.range === "week") {
    const d = startOfDay(now);
    d.setDate(d.getDate() - 7);
    return { gte: d };
  }

  if (filters.range === "month") {
    return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
  }

  if (filters.range === "year") {
    return { gte: new Date(now.getFullYear(), 0, 1) };
  }

  return {};
}

const PROMOTE_PLANS: PromotionPlan[] = ["HOMEPAGE_SPONSOR", "FEATURED_LISTING"];

function isPromotePlan(
  plan: AdminPaymentFilters["plan"],
): plan is PromotionPlan {
  return (
    plan != null &&
    plan !== "ALL" &&
    PROMOTE_PLANS.includes(plan as PromotionPlan)
  );
}

function buildWhere(filters: AdminPaymentFilters): Prisma.PaymentWhereInput {
  const createdAt = rangeToDates(filters);
  const and: Prisma.PaymentWhereInput[] = [];

  if (createdAt.gte || createdAt.lte) {
    and.push({
      createdAt: {
        ...(createdAt.gte ? { gte: createdAt.gte } : {}),
        ...(createdAt.lte ? { lte: createdAt.lte } : {}),
      },
    });
  }

  if (filters.status && filters.status !== "ALL") {
    and.push({ status: filters.status });
  }

  if (filters.plan && filters.plan !== "ALL") {
    if (isPromotePlan(filters.plan)) {
      and.push({ promotion: { plan: filters.plan } });
    } else {
      and.push({ tool: { listingPlan: filters.plan as ListingPlan } });
    }
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { submissionId: { contains: q, mode: "insensitive" } },
        { payerEmail: { contains: q, mode: "insensitive" } },
        { providerOrderId: { contains: q, mode: "insensitive" } },
        { providerCaptureId: { contains: q, mode: "insensitive" } },
        { tool: { name: { contains: q, mode: "insensitive" } } },
        {
          tool: {
            submitterEmail: { contains: q, mode: "insensitive" },
          },
        },
        {
          tool: {
            submittedBy: { email: { contains: q, mode: "insensitive" } },
          },
        },
        {
          promotion: {
            contactEmail: { contains: q, mode: "insensitive" },
          },
        },
        {
          promotion: {
            toolUrl: { contains: q, mode: "insensitive" },
          },
        },
        {
          promotion: {
            referenceId: { contains: q, mode: "insensitive" },
          },
        },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

const paymentInclude = {
  tool: {
    select: {
      name: true,
      listingPlan: true,
      submitterEmail: true,
      submittedBy: { select: { name: true, email: true } },
    },
  },
  promotion: {
    select: {
      id: true,
      plan: true,
      contactEmail: true,
      toolUrl: true,
      referenceId: true,
    },
  },
} as const;

function mapPayment(payment: {
  id: string;
  submissionId: string;
  toolId: string | null;
  promotionId: string | null;
  amount: { toNumber?: () => number } | number;
  currency: string;
  provider: AdminPaymentListItem["provider"];
  paymentMethod: AdminPaymentListItem["paymentMethod"];
  status: GatewayPaymentStatus;
  providerOrderId: string | null;
  providerCaptureId: string | null;
  createdAt: Date;
  paidAt: Date | null;
  payerEmail: string | null;
  tool: {
    name: string;
    listingPlan: ListingPlan;
    submitterEmail: string | null;
    submittedBy: { name: string | null; email: string } | null;
  } | null;
  promotion: {
    id: string;
    plan: PromotionPlan;
    contactEmail: string;
    toolUrl: string;
    referenceId: string;
  } | null;
}): AdminPaymentListItem {
  const amount =
    typeof payment.amount === "number"
      ? payment.amount
      : Number(payment.amount);

  const listingPlan = payment.tool?.listingPlan ?? null;
  const promotionPlan = payment.promotion?.plan ?? null;

  return {
    id: payment.id,
    submissionId: payment.submissionId,
    toolId: payment.toolId,
    promotionId: payment.promotionId,
    toolName: payment.tool?.name ?? null,
    userName: payment.tool?.submittedBy?.name ?? null,
    email:
      payment.promotion?.contactEmail ??
      payment.payerEmail ??
      payment.tool?.submitterEmail ??
      payment.tool?.submittedBy?.email ??
      null,
    contactEmail: payment.promotion?.contactEmail ?? null,
    toolUrl: payment.promotion?.toolUrl ?? null,
    listingPlan,
    promotionPlan,
    planLabel: formatAdminPaymentPlanLabel(listingPlan, promotionPlan),
    amount,
    currency: payment.currency,
    provider: payment.provider,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    providerOrderId: payment.providerOrderId,
    providerCaptureId: payment.providerCaptureId,
    createdAt: payment.createdAt,
    paidAt: payment.paidAt,
  };
}

export async function getAdminPayments(
  filters: AdminPaymentFilters = {},
): Promise<AdminPaymentListItem[]> {
  const payments = await prisma.payment.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: "desc" },
    take: 200,
    include: paymentInclude,
  });

  return payments.map((payment) => mapPayment(payment));
}

export async function getAdminPaymentById(
  id: string,
): Promise<AdminPaymentDetail | null> {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      ...paymentInclude,
      events: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          message: true,
          createdAt: true,
        },
      },
    },
  });

  if (!payment) {
    return null;
  }

  return {
    ...mapPayment(payment),
    payerEmail: payment.payerEmail,
    payerName: payment.payerName,
    country: payment.country,
    gatewayResponse: payment.gatewayResponse,
    refundAt: payment.refundAt,
    events: payment.events,
  };
}

export async function getAdminPaymentStats(): Promise<AdminPaymentStats> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [all, paidToday, paidMonth, byStatus, paidPlans] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      select: {
        tool: { select: { listingPlan: true } },
        promotion: { select: { plan: true } },
      },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    byStatus.map((row) => [row.status, row._count._all]),
  ) as Record<string, number>;

  const successful = countByStatus.PAID ?? 0;
  const pending = (countByStatus.CREATED ?? 0) + (countByStatus.APPROVED ?? 0);
  const failed = countByStatus.FAILED ?? 0;
  const cancelled = countByStatus.CANCELLED ?? 0;
  const refunded = countByStatus.REFUNDED ?? 0;

  const priorityCount = paidPlans.filter(
    (row) => row.tool?.listingPlan === "PRIORITY",
  ).length;
  const featuredCount = paidPlans.filter(
    (row) => row.tool?.listingPlan === "FEATURED",
  ).length;
  const homepageSponsorCount = paidPlans.filter(
    (row) => row.promotion?.plan === "HOMEPAGE_SPONSOR",
  ).length;
  const featuredListingCount = paidPlans.filter(
    (row) => row.promotion?.plan === "FEATURED_LISTING",
  ).length;

  return {
    todayRevenue: Number(paidToday._sum.amount ?? 0),
    monthlyRevenue: Number(paidMonth._sum.amount ?? 0),
    successful,
    pending,
    failed,
    cancelled,
    refunded,
    conversionRate: all > 0 ? Math.round((successful / all) * 1000) / 10 : 0,
    priorityCount,
    featuredCount,
    homepageSponsorCount,
    featuredListingCount,
  };
}

export function paymentsToCsv(rows: AdminPaymentListItem[]): string {
  const header = [
    "Reference ID",
    "User",
    "Email",
    "Contact Email",
    "Tool URL",
    "Package",
    "Amount",
    "Currency",
    "Provider",
    "Status",
    "Order ID",
    "Capture ID",
    "Created",
    "Paid At",
  ];

  const lines = rows.map((row) =>
    [
      row.submissionId,
      row.userName ?? "",
      row.email ?? "",
      row.contactEmail ?? "",
      row.toolUrl ?? "",
      row.planLabel ?? "",
      row.amount.toFixed(2),
      row.currency,
      row.provider,
      row.status,
      row.providerOrderId ?? "",
      row.providerCaptureId ?? "",
      row.createdAt.toISOString(),
      row.paidAt?.toISOString() ?? "",
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [header.join(","), ...lines].join("\n");
}
