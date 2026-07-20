import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getSubmissionSummary } from "@/actions/submit-tool";
import { PaymentSuccessTracker } from "@/components/payments/payment-event-trackers";
import { Button } from "@/components/ui/button";
import { PROMOTE_PLAN_LABELS, SUBMIT_PLAN_PRICES } from "@/lib/constants/tools";
import { createNoIndexMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";

export const metadata = createNoIndexMetadata({
  title: "Payment Successful",
  description:
    "Your payment for AIListify was successful. Your listing is now in priority review.",
  path: "/payment/success",
});

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    submissionId?: string;
    paymentId?: string;
    promotionId?: string;
    paid?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams;

  const promotion =
    params.promotionId != null
      ? await prisma.promotion.findUnique({
          where: { referenceId: params.promotionId },
          select: {
            id: true,
            referenceId: true,
            plan: true,
            contactEmail: true,
            toolUrl: true,
            status: true,
            amount: true,
            currency: true,
            paidAt: true,
          },
        })
      : null;

  if (promotion) {
    const payment =
      params.paymentId != null
        ? await prisma.payment.findUnique({
            where: { id: params.paymentId },
            select: {
              id: true,
              amount: true,
              currency: true,
              paidAt: true,
              status: true,
            },
          })
        : await prisma.payment.findFirst({
            where: {
              promotionId: promotion.id,
              status: "PAID",
            },
            orderBy: { paidAt: "desc" },
            select: {
              id: true,
              amount: true,
              currency: true,
              paidAt: true,
              status: true,
            },
          });

    const amount =
      payment != null ? Number(payment.amount) : Number(promotion.amount);

    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-[20px] border border-gray-200/80 bg-white p-8 text-center sm:p-10 dark:bg-card">
          <CheckCircle2
            className="mx-auto h-14 w-14 text-emerald-600"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Thank you!
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Your sponsorship payment was successful. Our team will review your
            placement details and follow up shortly.
          </p>

          <div className="mt-6 space-y-3 rounded-xl border bg-muted/20 p-4 text-left text-sm">
            <Row label="Reference ID" value={promotion.referenceId} />
            <Row label="Payment ID" value={payment?.id ?? "—"} />
            <Row label="Plan" value={PROMOTE_PLAN_LABELS[promotion.plan]} />
            <Row label="Contact email" value={promotion.contactEmail} />
            <Row label="Tool URL" value={promotion.toolUrl} />
            <Row
              label="Amount"
              value={`${payment?.currency ?? promotion.currency} ${amount.toFixed(2)}`}
            />
            <Row
              label="Paid time"
              value={
                (payment?.paidAt ?? promotion.paidAt)
                  ? new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(payment?.paidAt ?? promotion.paidAt!)
                  : "—"
              }
            />
            <Row
              label="Payment status"
              value={payment?.status ?? promotion.status}
            />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/promote">Back to promote</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return to AIListify</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const submission =
    params.submissionId != null
      ? await getSubmissionSummary(params.submissionId)
      : null;

  const payment =
    params.paymentId != null
      ? await prisma.payment.findUnique({
          where: { id: params.paymentId },
          select: {
            id: true,
            amount: true,
            currency: true,
            paidAt: true,
            status: true,
          },
        })
      : params.submissionId
        ? await prisma.payment.findFirst({
            where: {
              submissionId: params.submissionId,
              status: "PAID",
            },
            orderBy: { paidAt: "desc" },
            select: {
              id: true,
              amount: true,
              currency: true,
              paidAt: true,
              status: true,
            },
          })
        : null;

  const plan = submission?.listingPlan;
  const amount =
    payment != null
      ? Number(payment.amount)
      : plan === "FEATURED"
        ? SUBMIT_PLAN_PRICES.FEATURED
        : plan === "PRIORITY"
          ? SUBMIT_PLAN_PRICES.PRIORITY
          : null;

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <PaymentSuccessTracker
        submissionId={submission?.submissionId ?? params.submissionId}
        paymentId={payment?.id}
        plan={plan}
        amount={amount}
      />
      <div className="w-full max-w-xl rounded-[20px] border border-gray-200/80 bg-white p-8 text-center sm:p-10 dark:bg-card">
        <CheckCircle2
          className="mx-auto h-14 w-14 text-emerald-600"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Thank you!
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Your AI Tool has been successfully submitted. Our team will review
          your submission within 24 hours.
        </p>

        <div className="mt-6 space-y-3 rounded-xl border bg-muted/20 p-4 text-left text-sm">
          <Row
            label="Submission ID"
            value={submission?.submissionId ?? params.submissionId ?? "—"}
          />
          <Row label="Payment ID" value={payment?.id ?? "—"} />
          <Row label="Plan" value={plan ?? "—"} />
          <Row
            label="Amount"
            value={
              amount != null
                ? `${payment?.currency ?? "USD"} ${amount.toFixed(2)}`
                : "—"
            }
          />
          <Row
            label="Paid time"
            value={
              payment?.paidAt
                ? new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(payment.paidAt)
                : "—"
            }
          />
          <Row
            label="Payment status"
            value={submission?.paymentStatus ?? payment?.status ?? "PAID"}
          />
          <Row label="Review status" value={submission?.status ?? "PENDING"} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/my-tools">View my submissions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return to AIListify</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
