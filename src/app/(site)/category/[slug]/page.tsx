import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { DirectoryPagination } from "@/components/directory/directory-pagination";
import { ToolsPageSkeleton } from "@/components/directory/directory-skeletons";
import { ToolsGrid } from "@/components/directory/tools-grid";
import { parseSearchParams } from "@/lib/directory/url-state";
import { createNoIndexMetadata, createSeoMetadata } from "@/lib/metadata";
import { buildPaginationSeo } from "@/lib/seo/pagination";
import { getDirectoryCategoryBySlug } from "@/services/directory/categories";
import { getDirectoryTools } from "@/services/directory/tools";
import { toolDirectoryFiltersSchema } from "@/validations/directory";

type CategoryDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getDirectoryCategoryBySlug(slug);

  if (!category) {
    return createNoIndexMetadata({
      title: "Category Not Found",
      description: "The requested category could not be found.",
      path: `/category/${slug}`,
    });
  }

  const rawParams = await searchParams;
  const filters = toolDirectoryFiltersSchema.parse({
    ...parseSearchParams(rawParams),
    category: slug,
  });
  const result = await getDirectoryTools(filters);
  const pagination = buildPaginationSeo({
    basePath: `/category/${category.slug}`,
    filters,
    totalPages: result.totalPages,
    scoped: true,
  });

  return createSeoMetadata({
    title: `${category.name} AI Tools${pagination.titleSuffix}`,
    description: category.description,
    path: pagination.canonicalPath,
    pagination: {
      previous: pagination.prevPath,
      next: pagination.nextPath,
    },
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
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: category.name, path: basePath },
  ];

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {category.name}
          {filters.page > 1 ? ` — Page ${filters.page}` : ""}
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
