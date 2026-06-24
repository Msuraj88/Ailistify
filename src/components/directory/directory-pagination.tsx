import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ToolDirectoryFilters } from "@/validations/directory";

type DirectoryPaginationProps = {
  filters: ToolDirectoryFilters;
  total: number;
  totalPages: number;
  basePath?: string;
  scoped?: boolean;
};

function buildPageHref(
  filters: ToolDirectoryFilters,
  page: number,
  basePath: string,
  scoped = false,
) {
  const params = new URLSearchParams();

  if (!scoped) {
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.pricing) params.set("pricing", filters.pricing);
    if (filters.sort && filters.sort !== "latest") {
      params.set("sort", filters.sort);
    }
  }

  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function DirectoryPagination({
  filters,
  total,
  totalPages,
  basePath = "/tools",
  scoped = false,
}: DirectoryPaginationProps) {
  const start = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const end = Math.min(filters.page * filters.pageSize, total);
  const prevPage = filters.page > 1 ? filters.page - 1 : null;
  const nextPage = filters.page < totalPages ? filters.page + 1 : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total.toLocaleString()} tools
      </p>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild disabled={!prevPage}>
          {prevPage ? (
            <Link href={buildPageHref(filters, prevPage, basePath, scoped)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </span>
          )}
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {filters.page} of {totalPages}
        </span>

        <Button variant="outline" size="sm" asChild disabled={!nextPage}>
          {nextPage ? (
            <Link href={buildPageHref(filters, nextPage, basePath, scoped)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
