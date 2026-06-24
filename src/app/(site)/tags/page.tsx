import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { DirectoryGridSkeleton } from "@/components/directory/directory-skeletons";
import { DirectorySearchBar } from "@/components/directory/directory-search-bar";
import { TagCard } from "@/components/tools/tag-card";
import { EmptyState } from "@/components/admin/empty-state";
import { createSeoMetadata } from "@/lib/metadata";
import { buildSearchNoIndex } from "@/lib/seo/pagination";
import { getDirectoryTags } from "@/services/directory/tags";
import { directorySearchSchema } from "@/validations/directory";

type TagsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: TagsPageProps): Promise<Metadata> {
  const rawParams = await searchParams;
  const filters = directorySearchSchema.parse({
    q: Array.isArray(rawParams.q) ? rawParams.q[0] : rawParams.q,
  });

  const title = filters.q?.trim()
    ? `Tags matching "${filters.q.trim()}"`
    : "AI Tool Tags";
  const description = filters.q?.trim()
    ? `Search results for tags matching "${filters.q.trim()}" in AIListify.`
    : "Browse AI tools by tag — chatbots, image generation, coding, writing, and more.";

  return createSeoMetadata({
    title,
    description,
    path: filters.q?.trim()
      ? `/tags?q=${encodeURIComponent(filters.q.trim())}`
      : "/tags",
    noIndex: buildSearchNoIndex("/tags", filters.q),
  });
}

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const rawParams = await searchParams;
  const filters = directorySearchSchema.parse({
    q: Array.isArray(rawParams.q) ? rawParams.q[0] : rawParams.q,
  });

  const tags = await getDirectoryTags(filters);

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Tags", path: "/tags" },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tags</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Discover AI tools by topic, use case, and capability.
        </p>
      </div>

      <Suspense fallback={<DirectoryGridSkeleton />}>
        <DirectorySearchBar basePath="/tags" placeholder="Search tags..." />
      </Suspense>

      {tags.length === 0 ? (
        <EmptyState
          title="No tags found"
          description="Try a different search term."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
