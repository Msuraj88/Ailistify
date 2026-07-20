import Link from "next/link";
import { Ban } from "lucide-react";
import { PaymentCancelledTracker } from "@/components/payments/payment-event-trackers";
import { Button } from "@/components/ui/button";
import { PaymentService } from "@/lib/payments/services/payment-service";
import { createNoIndexMetadata } from "@/lib/metadata";

export const metadata = createNoIndexMetadata({
  title: "Payment Cancelled",
  description: "Your AIListify payment was cancelled. You can retry later.",
  path: "/payment/cancel",
});

type PaymentCancelPageProps = {
  searchParams: Promise<{ submissionId?: string }>;
};

export default async function PaymentCancelPage({
  searchParams,
}: PaymentCancelPageProps) {
  const params = await searchParams;

  if (params.submissionId) {
    await PaymentService.markCancelled(params.submissionId).catch(
      () => undefined,
    );
  }

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <PaymentCancelledTracker submissionId={params.submissionId} />
      <div className="w-full max-w-xl rounded-[20px] border bg-card p-8 text-center sm:p-10">
        <Ban
          className="mx-auto h-14 w-14 text-muted-foreground"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Payment Cancelled
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Your submission has been saved. You can complete your payment later
          from My Tools.
        </p>
        {params.submissionId && (
          <p className="mt-4 text-sm text-muted-foreground">
            Submission ID:{" "}
            <span className="font-medium text-foreground">
              {params.submissionId}
            </span>
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/my-tools">Retry Payment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
