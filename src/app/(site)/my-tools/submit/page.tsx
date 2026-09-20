import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UserToolForm } from "@/components/submit-tool/user-tool-form";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/session";
import { createSeoMetadata } from "@/lib/metadata";
import { getSubmitToolFormOptions } from "@/services/submit-tool";

export const metadata = createSeoMetadata({
  title: "Submit Tool",
  description: "Submit your AI tool to the AIListify review queue.",
  path: "/my-tools/submit",
  noIndex: true,
});

export const maxDuration = 120;

export default async function MyToolsSubmitPage() {
  const session = await requireAuth("/my-tools/submit");
  const options = await getSubmitToolFormOptions();

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "My Tools", path: "/my-tools" },
          { name: "Submit Tool", path: "/my-tools/submit" },
        ]}
      />

      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/my-tools">
          <ChevronLeft className="h-4 w-4" />
          Back to My Tools
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Submit Tool
        </h1>
        <p className="mt-2 text-muted-foreground">
          Use AI Analyze or write the listing yourself, select a plan, then
          continue to secure checkout.
        </p>
      </div>

      <UserToolForm
        mode="create"
        options={options}
        defaultValues={{
          submitterEmail: session.user.email ?? "",
          listingPlan: "FREE",
        }}
      />
    </div>
  );
}
