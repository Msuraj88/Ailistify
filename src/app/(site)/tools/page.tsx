import { Suspense } from "react";
import { DirectoryPagination } from "@/components/directory/directory-pagination";
import { ToolsPageSkeleton } from "@/components/directory/directory-skeletons";
import { ToolsFilters } from "@/components/directory/tools-filters";
import { ToolsGrid } from "@/components/directory/tools-grid";
import { parseSearchParams } from "@/lib/directory/url-state";
import { createPageMetadata } from "@/lib/metadata";
import {
  getDirectoryFilterOptions,
  getDirectoryTools,
} from "@/services/directory/tools";
import { toolDirectoryFiltersSchema } from "@/validations/directory";

export const metadata = createPageMetadata({
  title: "Browse AI Tools",
  description:
    "Search and filter the AIListify directory of AI tools by category, tag, pricing, and popularity.",
  path: "/tools",
});

type ToolsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const rawParams = await searchParams;
  const filters = toolDirectoryFiltersSchema.parse(
    parseSearchParams(rawParams),
  );

  const [result, filterOptions] = await Promise.all([
    getDirectoryTools(filters),
    getDirectoryFilterOptions(),
  ]);

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Browse AI Tools
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Discover, compare, and explore {result.total.toLocaleString()} AI
          tools across categories and tags.
        </p>
      </div>

      <Suspense fallback={<ToolsPageSkeleton />}>
        <ToolsFilters
          categories={filterOptions.categories}
          tags={filterOptions.tags}
        />
      </Suspense>

      <ToolsGrid tools={result.tools} />

      {result.total > 0 && (
        <DirectoryPagination
          filters={filters}
          total={result.total}
          totalPages={result.totalPages}
        />
      )}
    </div>
  );
}
