"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminMarkPaymentPaid } from "@/actions/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AdminPaymentDetail,
  AdminPaymentListItem,
  AdminPaymentStats,
} from "@/types/admin-payments";

type PaymentsManagerProps = {
  stats: AdminPaymentStats;
  payments: AdminPaymentListItem[];
};

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDateTime(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function statusVariant(status: string) {
  switch (status) {
    case "PAID":
      return "default" as const;
    case "FAILED":
      return "destructive" as const;
    case "CANCELLED":
    case "REFUNDED":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function PaymentsManager({ stats, payments }: PaymentsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [detail, setDetail] = useState<AdminPaymentDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const plan = searchParams.get("plan") ?? "ALL";
  const range = searchParams.get("range") ?? "all";

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "ALL" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => {
      router.push(`/admin/payments?${params.toString()}`);
    });
  }

  async function openDetails(paymentId: string) {
    setLoadingDetail(true);
    setDetailOpen(true);
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`);
      if (!response.ok) {
        throw new Error("Failed to load payment");
      }
      const data = (await response.json()) as AdminPaymentDetail;
      setDetail(data);
    } catch {
      toast.error("Could not load payment details.");
      setDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function markPaid(paymentId: string) {
    const result = await adminMarkPaymentPaid(paymentId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Payment marked as paid.");
    router.refresh();
    void openDetails(paymentId);
  }

  const csvHref = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("export", "csv");
    return `/api/admin/payments/export?${params.toString()}`;
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Payments
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track checkout revenue, statuses, and submission payments.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={csvHref}>
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's revenue"
          value={formatMoney(stats.todayRevenue)}
        />
        <StatCard
          title="Monthly revenue"
          value={formatMoney(stats.monthlyRevenue)}
        />
        <StatCard title="Successful" value={String(stats.successful)} />
        <StatCard title="Conversion rate" value={`${stats.conversionRate}%`} />
        <StatCard title="Pending" value={String(stats.pending)} />
        <StatCard title="Failed" value={String(stats.failed)} />
        <StatCard title="Cancelled" value={String(stats.cancelled)} />
        <StatCard title="Refunded" value={String(stats.refunded)} />
      </div>

      <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">Priority listing</p>
          <p className="text-2xl font-semibold">{stats.priorityCount}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Featured listing (tools)
          </p>
          <p className="text-2xl font-semibold">{stats.featuredCount}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Homepage sponsor</p>
          <p className="text-2xl font-semibold">{stats.homepageSponsorCount}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Featured listing (promote)
          </p>
          <p className="text-2xl font-semibold">{stats.featuredListingCount}</p>
        </div>
      </div>

      <form
        className="flex flex-col gap-3 lg:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          updateParams({ q: String(form.get("q") ?? "") });
        }}
      >
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search ID, email, tool URL..."
          className="lg:max-w-sm"
        />
        <Select
          value={status}
          onValueChange={(value) => updateParams({ status: value })}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="CREATED">Created</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={plan}
          onValueChange={(value) => updateParams({ plan: value })}
        >
          <SelectTrigger className="w-full lg:w-[220px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All plans</SelectItem>
            <SelectItem value="PRIORITY">Priority</SelectItem>
            <SelectItem value="FEATURED">Featured (tools)</SelectItem>
            <SelectItem value="HOMEPAGE_SPONSOR">Homepage Sponsor</SelectItem>
            <SelectItem value="FEATURED_LISTING">
              Featured Listing (promote)
            </SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={range}
          onValueChange={(value) => updateParams({ range: value })}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : "Search"}
        </Button>
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Tool URL</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Paid At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.planLabel ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {payment.contactEmail ?? payment.email ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {payment.toolUrl ? (
                      <a
                        href={payment.toolUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-foreground underline-offset-2 hover:underline"
                      >
                        {payment.toolUrl}
                      </a>
                    ) : (
                      (payment.toolName ?? "—")
                    )}
                  </TableCell>
                  <TableCell>
                    {formatMoney(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                    {payment.submissionId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(payment.paidAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => void openDetails(payment.id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      {payment.toolId && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/tools/${payment.toolId}/edit`}>
                            Tool
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment details</DialogTitle>
          </DialogHeader>
          {loadingDetail || !detail ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <DetailRow label="Reference ID" value={detail.submissionId} />
              {detail.promotionPlan ? (
                <>
                  <DetailRow
                    label="Promotion type"
                    value={detail.planLabel ?? detail.promotionPlan}
                  />
                  <DetailRow
                    label="Contact email"
                    value={detail.contactEmail ?? "—"}
                  />
                  <DetailRow label="Tool URL" value={detail.toolUrl ?? "—"} />
                </>
              ) : (
                <>
                  <DetailRow label="Tool" value={detail.toolName ?? "—"} />
                  <DetailRow label="User" value={detail.userName ?? "—"} />
                  <DetailRow label="Email" value={detail.email ?? "—"} />
                  <DetailRow
                    label="Plan"
                    value={detail.planLabel ?? detail.listingPlan ?? "—"}
                  />
                </>
              )}
              <DetailRow
                label="Amount"
                value={formatMoney(detail.amount, detail.currency)}
              />
              <DetailRow label="Provider" value={detail.provider} />
              <DetailRow
                label="Payment method"
                value={detail.paymentMethod ?? "—"}
              />
              <DetailRow label="Status" value={detail.status} />
              <DetailRow
                label="Order ID"
                value={detail.providerOrderId ?? "—"}
              />
              <DetailRow
                label="Capture ID"
                value={detail.providerCaptureId ?? "—"}
              />
              <DetailRow label="Payer email" value={detail.payerEmail ?? "—"} />
              <DetailRow label="Payer name" value={detail.payerName ?? "—"} />
              <DetailRow label="Country" value={detail.country ?? "—"} />
              <DetailRow
                label="Created"
                value={formatDateTime(detail.createdAt)}
              />
              <DetailRow
                label="Paid at"
                value={formatDateTime(detail.paidAt)}
              />

              <div>
                <p className="mb-2 font-medium">Payment timeline</p>
                <ul className="space-y-2">
                  {detail.events.map((event) => (
                    <li
                      key={event.id}
                      className="rounded-md border px-3 py-2 text-xs"
                    >
                      <p className="font-medium">{event.type}</p>
                      <p className="text-muted-foreground">
                        {formatDateTime(event.createdAt)}
                      </p>
                      {event.message && (
                        <p className="mt-1 text-muted-foreground">
                          {event.message}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {detail.gatewayResponse != null && (
                <div>
                  <p className="mb-2 font-medium">Gateway response</p>
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-[11px]">
                    {JSON.stringify(detail.gatewayResponse, null, 2)}
                  </pre>
                </div>
              )}

              {detail.status !== "PAID" && (
                <Button onClick={() => void markPaid(detail.id)}>
                  Mark paid (admin)
                </Button>
              )}
              <Button variant="outline" disabled title="Coming soon">
                Refund (future)
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
