import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content";
import {
  privacyPolicyMeta,
  privacyPolicySections,
} from "@/content/privacy-policy";
import { createSeoMetadata } from "@/lib/metadata";

export const metadata: Metadata = createSeoMetadata({
  title: privacyPolicyMeta.title,
  description:
    "Read the AIListify Privacy Policy to learn how we collect, use, and protect your personal data.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {privacyPolicyMeta.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {privacyPolicyMeta.lastUpdated}
        </p>
      </div>

      <PrivacyPolicyContent sections={privacyPolicySections} />
    </div>
  );
}
