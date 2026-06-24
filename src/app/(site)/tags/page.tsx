import { Suspense } from "react";
import { DirectoryGridSkeleton } from "@/components/directory/directory-skeletons";
import { DirectorySearchBar } from "@/components/directory/directory-search-bar";
import { TagCard } from "@/components/tools/tag-card";
import { EmptyState } from "@/components/admin/empty-state";
import { createPageMetadata } from "@/lib/metadata";
import { getDirectoryTags } from "@/services/directory/tags";
import { directorySearchSchema } from "@/validations/directory";

export const metadata = createPageMetadata({
  title: "AI Tool Tags",
  description:
    "Browse AI tools by tag — chatbots, image generation, coding, writing, and more.",
  path: "/tags",
});

type TagsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const rawParams = await searchParams;
  const filters = directorySearchSchema.parse({
    q: Array.isArray(rawParams.q) ? rawParams.q[0] : rawParams.q,
  });

  const tags = await getDirectoryTags(filters);

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
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
