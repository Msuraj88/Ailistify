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
import { getDirectoryTagBySlug } from "@/services/directory/tags";
import { getDirectoryTools } from "@/services/directory/tools";
import { toolDirectoryFiltersSchema } from "@/validations/directory";

type TagDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: TagDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getDirectoryTagBySlug(slug);

  if (!tag) {
    return createNoIndexMetadata({
      title: "Tag Not Found",
      description: "The requested tag could not be found.",
      path: `/tag/${slug}`,
    });
  }

  const rawParams = await searchParams;
  const filters = toolDirectoryFiltersSchema.parse({
    ...parseSearchParams(rawParams),
    tag: slug,
  });
  const result = await getDirectoryTools(filters);
  const pagination = buildPaginationSeo({
    basePath: `/tag/${tag.slug}`,
    filters,
    totalPages: result.totalPages,
    scoped: true,
  });

  const title = `${tag.metaTitle ?? `${tag.name} AI Tools`}${pagination.titleSuffix}`;
  const description =
    tag.metaDescription ??
    tag.description ??
    `Browse AI tools tagged with ${tag.name}.`;

  return createSeoMetadata({
    title,
    description,
    path: pagination.canonicalPath,
    pagination: {
      previous: pagination.prevPath,
      next: pagination.nextPath,
    },
  });
}

export default async function TagDetailPage({
  params,
  searchParams,
}: TagDetailPageProps) {
  const { slug } = await params;
  const tag = await getDirectoryTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const rawParams = await searchParams;
  const filters = toolDirectoryFiltersSchema.parse({
    ...parseSearchParams(rawParams),
    tag: slug,
  });

  const result = await getDirectoryTools(filters);
  const basePath = `/tag/${slug}`;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Tags", path: "/tags" },
    { name: tag.name, path: basePath },
  ];

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        #{tag.name}
        {filters.page > 1 ? ` — Page ${filters.page}` : ""}
      </h1>

      <Suspense fallback={<ToolsPageSkeleton />}>
        <ToolsGrid
          tools={result.tools}
          emptyTitle={`No tools tagged ${tag.name}`}
          emptyDescription="Tools with this tag will appear here once published."
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
