import type { Metadata } from "next";
import { PromotePageContent } from "@/components/promote/promote-page-content";
import { promoteMeta } from "@/content/promote";
import { createSeoMetadata } from "@/lib/metadata";

export const metadata: Metadata = createSeoMetadata({
  title: promoteMeta.title,
  description:
    "Promote your AI tool on AIListify with homepage sponsor chip, featured listings, and sponsored placements.",
  path: "/promote",
});

export default function PromotePage() {
  return <PromotePageContent />;
}
