import { createSeoMetadata } from "@/lib/metadata";
import { SubmitPackages } from "@/components/submit-tool/submit-packages";

export const metadata = createSeoMetadata({
  title: "Submit Your AI Tool",
  description:
    "Launch your AI product on AIListify with priority review and featured listing options.",
  path: "/submit",
});

export default function SubmitPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <SubmitPackages />
    </div>
  );
}
