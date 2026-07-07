import type { BlogStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";

export function BlogStatusBadge({ status }: { status: BlogStatus }) {
  const variant =
    status === "PUBLISHED"
      ? "default"
      : status === "SCHEDULED"
        ? "secondary"
        : status === "DRAFT"
          ? "outline"
          : "destructive";

  return <Badge variant={variant}>{BLOG_STATUS_LABELS[status]}</Badge>;
}
