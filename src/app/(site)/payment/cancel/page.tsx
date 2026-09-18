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
  searchParams: Promise<{ submissionId?: string; promotionId?: string }>;
};

export default async function PaymentCancelPage({
  searchParams,
}: PaymentCancelPageProps) {
  const params = await searchParams;
  const referenceId = params.submissionId ?? params.promotionId;

  if (referenceId) {
    await PaymentService.markCancelled(referenceId).catch(() => undefined);
  }

  const isPromotion = Boolean(params.promotionId && !params.submissionId);

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
          {isPromotion
            ? "Your sponsorship details were saved. You can restart checkout from the promote page anytime."
            : "Your submission has been saved. You can complete your payment later from My Tools."}
        </p>
        {referenceId && (
          <p className="mt-4 text-sm text-muted-foreground">
            Reference ID:{" "}
            <span className="font-medium text-foreground">{referenceId}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={isPromotion ? "/promote" : "/my-tools"}>
              {isPromotion ? "Back to promote" : "Retry Payment"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
