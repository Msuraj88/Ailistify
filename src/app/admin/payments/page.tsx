import type { GatewayPaymentStatus } from "@/generated/prisma/client";
import { Suspense } from "react";
import { PaymentsManager } from "@/components/admin/payments/payments-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { createMetadata } from "@/lib/metadata";
import {
  getAdminPaymentStats,
  getAdminPayments,
} from "@/services/admin/payments";
import type {
  AdminPaymentFilters,
  AdminPaymentPlanFilter,
} from "@/types/admin-payments";

export const metadata = createMetadata({
  title: "Payments",
  description: "Manage AIListify payments and checkout activity.",
});

type AdminPaymentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  const rawParams = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const filters: AdminPaymentFilters = {
    q: normalized.q,
    status: (normalized.status as GatewayPaymentStatus | "ALL") ?? "ALL",
    plan: (normalized.plan as AdminPaymentPlanFilter) ?? "ALL",
    range: (normalized.range as AdminPaymentFilters["range"]) ?? "all",
    from: normalized.from,
    to: normalized.to,
  };

  const [stats, payments] = await Promise.all([
    getAdminPaymentStats(),
    getAdminPayments(filters),
  ]);

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <PaymentsManager stats={stats} payments={payments} />
    </Suspense>
  );
}
