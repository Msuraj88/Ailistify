import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ToolListFilters } from "@/validations/admin-tools";

type ToolsPaginationProps = {
  filters: ToolListFilters;
  total: number;
  totalPages: number;
};

function buildPageHref(filters: ToolListFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.status) params.set("status", filters.status);
  if (filters.pricingModel) params.set("pricingModel", filters.pricingModel);
  if (filters.featured !== undefined) {
    params.set("featured", String(filters.featured));
  }
  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/tools?${query}` : "/admin/tools";
}

export function ToolsPagination({
  filters,
  total,
  totalPages,
}: ToolsPaginationProps) {
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
            <Link href={buildPageHref(filters, prevPage)}>
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
            <Link href={buildPageHref(filters, nextPage)}>
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
