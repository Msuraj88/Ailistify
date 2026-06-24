import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DirectoryPagination } from "@/components/directory/directory-pagination";
import { ToolsPageSkeleton } from "@/components/directory/directory-skeletons";
import { ToolsGrid } from "@/components/directory/tools-grid";
import { createPageMetadata } from "@/lib/metadata";
import { getDirectoryCategoryBySlug } from "@/services/directory/categories";
import { getDirectoryTools } from "@/services/directory/tools";
import { parseSearchParams } from "@/lib/directory/url-state";
import { toolDirectoryFiltersSchema } from "@/validations/directory";

type CategoryDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getDirectoryCategoryBySlug(slug);

  if (!category) {
    return createPageMetadata({
      title: "Category Not Found",
      description: "The requested category could not be found.",
      path: `/category/${slug}`,
    });
  }

  return createPageMetadata({
    title: `${category.name} AI Tools`,
    description: category.description,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await getDirectoryCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const rawParams = await searchParams;
  const filters = toolDirectoryFiltersSchema.parse({
    ...parseSearchParams(rawParams),
    category: slug,
  });

  const result = await getDirectoryTools(filters);
  const basePath = `/category/${slug}`;

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {category.description}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {category.toolCount} tool{category.toolCount === 1 ? "" : "s"}{" "}
          published
        </p>
      </div>

      <Suspense fallback={<ToolsPageSkeleton />}>
        <ToolsGrid
          tools={result.tools}
          emptyTitle={`No tools in ${category.name}`}
          emptyDescription="Tools in this category will appear here once published."
        />
      </Suspense>

      {result.total > 0 && (
        <DirectoryPagination
          filters={filters}
          total={result.total}
          totalPages={result.totalPages}
          basePath={basePath}
          scoped
        />
      )}
    </div>
  );
}
