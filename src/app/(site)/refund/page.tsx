import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PolicyContent } from "@/components/legal/policy-content";
import {
  refundPolicyMeta,
  refundPolicySections,
} from "@/content/refund-policy";
import { createSeoMetadata } from "@/lib/metadata";

export const metadata: Metadata = createSeoMetadata({
  title: refundPolicyMeta.title,
  description:
    "Read the AIListify Refund Policy for digital listing and promotional services.",
  path: "/refund",
});

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Refund Policy", path: "/refund" },
        ]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {refundPolicyMeta.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {refundPolicyMeta.lastUpdated}
        </p>
      </div>

      <PolicyContent sections={refundPolicySections} />
    </div>
  );
}
