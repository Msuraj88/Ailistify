import Link from "next/link";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import type { BlogStatus } from "@/generated/prisma/client";

type BlogPreviewBannerProps = {
  status: BlogStatus;
  editHref: string;
};

export function BlogPreviewBanner({
  status,
  editHref,
}: BlogPreviewBannerProps) {
  return (
    <div className="border-b bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="container mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <p>
          <span className="font-semibold">Preview mode</span> — this post is{" "}
          <span className="font-medium">{BLOG_STATUS_LABELS[status]}</span> and
          is not visible to the public.
        </p>
        <Link
          href={editHref}
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          Back to editor
        </Link>
      </div>
    </div>
  );
}
