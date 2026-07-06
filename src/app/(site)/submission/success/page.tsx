import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getSubmissionSummary } from "@/actions/submit-tool";
import { Button } from "@/components/ui/button";
import { FREE_QUEUE_STATS } from "@/lib/constants/tools";
import { createNoIndexMetadata } from "@/lib/metadata";

export const metadata = createNoIndexMetadata({
  title: "Submission Successful",
  description: "Your AI tool submission has been received by AIListify.",
  path: "/submission/success",
});

type SubmissionSuccessPageProps = {
  searchParams: Promise<{ submissionId?: string }>;
};

export default async function SubmissionSuccessPage({
  searchParams,
}: SubmissionSuccessPageProps) {
  const params = await searchParams;
  const submission =
    params.submissionId != null
      ? await getSubmissionSummary(params.submissionId)
      : null;

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-[20px] border border-gray-200/80 bg-white p-8 text-center sm:p-10">
        <CheckCircle2
          className="mx-auto h-14 w-14 text-emerald-600"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Your AI Tool Has Been Submitted!
        </h1>

        {submission && (
          <div className="mt-6 space-y-3 rounded-xl border bg-muted/20 p-4 text-left text-sm">
            <Row label="Submission ID" value={submission.submissionId ?? "—"} />
            <Row label="Selected Plan" value={submission.listingPlan} />
            <Row label="Payment Status" value={submission.paymentStatus} />
            <Row label="Review Status" value={submission.status} />
          </div>
        )}

        <div className="mt-6 space-y-3 rounded-xl border border-dashed bg-gray-50/80 p-4 text-left">
          <Row
            label="Current Queue"
            value={`${FREE_QUEUE_STATS.waitingCount}+ tools waiting`}
          />
          <Row
            label="Estimated Review"
            value={`${FREE_QUEUE_STATS.reviewDaysMin}–${FREE_QUEUE_STATS.reviewDaysMax} Days`}
          />
        </div>

        <div className="mt-8">
          <Button
            asChild
            className="h-10 rounded-full bg-neutral-950 px-6 text-white hover:bg-neutral-800"
          >
            <Link href="/">Return to AIListify</Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Contact:{" "}
            <a
              href="mailto:hello@ailistify.com"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              hello@ailistify.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
