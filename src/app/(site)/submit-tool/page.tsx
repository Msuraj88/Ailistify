import { auth } from "@/lib/auth";
import { createSeoMetadata } from "@/lib/metadata";
import { getSubmitToolFormOptions } from "@/services/submit-tool";
import { SubmitToolForm } from "@/components/submit-tool/submit-tool-form";

export const metadata = createSeoMetadata({
  title: "Submit an AI Tool",
  description:
    "Submit your AI tool to AIListify for review. Share your product with our community after approval.",
  path: "/submit-tool",
});

export default async function SubmitToolPage() {
  const [options, session] = await Promise.all([
    getSubmitToolFormOptions(),
    auth(),
  ]);

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Submit an AI Tool
        </h1>
        <p className="text-muted-foreground">
          Share your AI tool with the AIListify community. Submissions are
          reviewed before publishing.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <SubmitToolForm
          options={options}
          defaultEmail={session?.user?.email ?? undefined}
        />
      </div>
    </div>
  );
}
