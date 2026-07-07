"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BLOG_STATUSES, BLOG_STATUS_LABELS } from "@/lib/constants/blog";

type BlogsFiltersProps = {
  categories: { id: string; name: string; slug: string }[];
  currentStatus?: string;
  currentCategoryId?: string;
};

export function BlogsFilters({
  categories,
  currentStatus,
  currentCategoryId,
}: BlogsFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        asChild
        size="sm"
        variant={!currentStatus ? "default" : "outline"}
      >
        <Link href={buildHref({ status: undefined })}>All</Link>
      </Button>
      {BLOG_STATUSES.filter((status) =>
        ["DRAFT", "PUBLISHED", "SCHEDULED"].includes(status),
      ).map((status) => (
        <Button
          key={status}
          asChild
          size="sm"
          variant={currentStatus === status ? "default" : "outline"}
        >
          <Link href={buildHref({ status })}>{BLOG_STATUS_LABELS[status]}</Link>
        </Button>
      ))}
      {categories.map((category) => (
        <Button
          key={category.id}
          asChild
          size="sm"
          variant={currentCategoryId === category.id ? "default" : "outline"}
        >
          <Link href={buildHref({ categoryId: category.id })}>
            {category.name}
          </Link>
        </Button>
      ))}
    </div>
  );
}
