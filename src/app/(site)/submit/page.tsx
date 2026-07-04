import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createSeoMetadata } from "@/lib/metadata";
import { getSubmitToolFormOptions } from "@/services/submit-tool";
import { SubmitToolFlow } from "@/components/submit-tool/submit-tool-flow";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = createSeoMetadata({
  title: "Submit Your AI Tool",
  description:
    "Launch your AI product on AIListify with AI-powered form prefill, priority review, and featured listing options.",
  path: "/submit",
});

function SubmitFlowSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-40 w-full rounded-[20px]" />
      <Skeleton className="h-96 w-full rounded-[20px]" />
    </div>
  );
}

export default async function SubmitPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/submit");
  }

  const options = await getSubmitToolFormOptions();
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<SubmitFlowSkeleton />}>
        <SubmitToolFlow
          options={options}
          defaultEmail={session.user.email ?? undefined}
          paypalClientId={paypalClientId}
        />
      </Suspense>
    </div>
  );
}
