import Link from "next/link";
import { XCircle } from "lucide-react";
import { PaymentFailedTracker } from "@/components/payments/payment-event-trackers";
import { Button } from "@/components/ui/button";
import { createNoIndexMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const metadata = createNoIndexMetadata({
  title: "Payment Failed",
  description: "Your AIListify payment could not be completed.",
  path: "/payment/failed",
});

type PaymentFailedPageProps = {
  searchParams: Promise<{ submissionId?: string; reason?: string }>;
};

export default async function PaymentFailedPage({
  searchParams,
}: PaymentFailedPageProps) {
  const params = await searchParams;
  const session = await auth();

  const tool =
    params.submissionId && session?.user
      ? await prisma.tool.findFirst({
          where: {
            submissionId: params.submissionId,
            submittedById: session.user.id,
          },
          select: { id: true, submissionId: true },
        })
      : null;

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <PaymentFailedTracker
        submissionId={params.submissionId}
        reason={params.reason}
      />
      <div className="w-full max-w-xl rounded-[20px] border bg-card p-8 text-center sm:p-10">
        <XCircle
          className="mx-auto h-14 w-14 text-destructive"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Payment Failed
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          We could not complete your payment. Your submission has been saved —
          you can retry anytime.
        </p>
        {params.reason && (
          <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {params.reason}
          </p>
        )}
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
        {tool && (
          <p className="mt-4 text-xs text-muted-foreground">
            Tip: open My Tools and click Retry Payment on this submission.
          </p>
        )}
      </div>
    </div>
  );
}
