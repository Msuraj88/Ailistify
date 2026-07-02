import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PolicyContent } from "@/components/legal/policy-content";
import {
  termsAndConditionsMeta,
  termsAndConditionsSections,
} from "@/content/terms-and-conditions";
import { createSeoMetadata } from "@/lib/metadata";

export const metadata: Metadata = createSeoMetadata({
  title: termsAndConditionsMeta.title,
  description:
    "Read the AIListify Terms & Conditions governing use of our website and listing services.",
  path: "/terms",
});

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Terms & Conditions", path: "/terms" },
        ]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {termsAndConditionsMeta.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {termsAndConditionsMeta.lastUpdated}
        </p>
      </div>

      <PolicyContent sections={termsAndConditionsSections} />
    </div>
  );
}
