import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DirectoryPagination } from "@/components/directory/directory-pagination";
import { ToolsPageSkeleton } from "@/components/directory/directory-skeletons";
import { ToolsGrid } from "@/components/directory/tools-grid";
import { createPageMetadata } from "@/lib/metadata";
import { getDirectoryTagBySlug } from "@/services/directory/tags";
import { getDirectoryTools } from "@/services/directory/tools";
import { toolDirectoryFiltersSchema } from "@/validations/directory";

type TagDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: TagDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getDirectoryTagBySlug(slug);

  if (!tag) {
    return createPageMetadata({
      title: "Tag Not Found",
      description: "The requested tag could not be found.",
      path: `/tag/${slug}`,
    });
  }

  return createPageMetadata({
    title: tag.metaTitle ?? `${tag.name} AI Tools`,
    description:
      tag.metaDescription ??
      tag.description ??
      `Browse AI tools tagged with ${tag.name}.`,
    path: `/tag/${tag.slug}`,
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
  const normalizedParams = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const filters = toolDirectoryFiltersSchema.parse({
    ...normalizedParams,
    tag: slug,
  });

  const result = await getDirectoryTools(filters);
  const basePath = `/tag/${slug}`;

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          #{tag.name}
        </h1>
        {tag.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {tag.description}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {tag.toolCount} tool{tag.toolCount === 1 ? "" : "s"} tagged
        </p>
      </div>

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
