import { Suspense } from "react";
import { AdminToolsActions } from "@/components/admin/tools/admin-tools-actions";
import { ToolsFilters } from "@/components/admin/tools/tools-filters";
import { ToolsPagination } from "@/components/admin/tools/tools-pagination";
import { ToolsTable } from "@/components/admin/tools/tools-table";
import { Skeleton } from "@/components/ui/skeleton";
import { createMetadata } from "@/lib/metadata";
import { getAdminToolCategories, getAdminTools } from "@/services/admin/tools";
import { toolListFiltersSchema } from "@/validations/admin-tools";

export const metadata = createMetadata({
  title: "Tools",
  description: "Manage AI tool listings in the AIListify admin.",
});

type AdminToolsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function FiltersSkeleton() {
  return <Skeleton className="h-40 w-full rounded-lg" />;
}

export default async function AdminToolsPage({
  searchParams,
}: AdminToolsPageProps) {
  const rawParams = await searchParams;
  const normalizedParams = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const filters = toolListFiltersSchema.parse(normalizedParams);

  const [result, categories] = await Promise.all([
    getAdminTools(filters),
    getAdminToolCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tools
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage AI tool listings, approvals, and featured placements.
          </p>
        </div>
        <AdminToolsActions />
      </div>

      <Suspense fallback={<FiltersSkeleton />}>
        <ToolsFilters categories={categories} />
      </Suspense>

      <ToolsTable tools={result.tools} />

      <ToolsPagination
        filters={filters}
        total={result.total}
        totalPages={result.totalPages}
      />
    </div>
  );
}
