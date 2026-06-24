import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildToolsDirectoryHref } from "@/lib/directory/url-state";
import { Button } from "@/components/ui/button";
import type { ToolDirectoryFilters } from "@/validations/directory";

type DirectoryPaginationProps = {
  filters: ToolDirectoryFilters;
  total: number;
  totalPages: number;
  basePath?: string;
  scoped?: boolean;
};

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
            <Link
              href={buildToolsDirectoryHref(filters, {
                basePath,
                page: prevPage,
                scoped,
              })}
            >
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
            <Link
              href={buildToolsDirectoryHref(filters, {
                basePath,
                page: nextPage,
                scoped,
              })}
            >
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
