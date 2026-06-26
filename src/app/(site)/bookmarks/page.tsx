import type { Metadata } from "next";
import { Suspense } from "react";
import { BookmarksEmptyState } from "@/components/bookmarks/bookmarks-empty-state";
import { BookmarksFilters } from "@/components/bookmarks/bookmarks-filters";
import { BookmarksPagination } from "@/components/bookmarks/bookmarks-pagination";
import { ToolsGrid } from "@/components/directory/tools-grid";
import { EmptyState } from "@/components/admin/empty-state";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { requireAuth } from "@/lib/auth/session";
import { parseSearchParams } from "@/lib/directory/url-state";
import { createSeoMetadata } from "@/lib/metadata";
import { getUserBookmarks } from "@/services/bookmarks";
import { bookmarkFiltersSchema } from "@/validations/bookmarks";

export const metadata: Metadata = createSeoMetadata({
  title: "My Bookmarks",
  description: "View and manage your saved AI tools on AIListify.",
  path: "/bookmarks",
  noIndex: true,
});

type BookmarksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  const session = await requireAuth("/bookmarks");
  const rawParams = await searchParams;
  const filters = bookmarkFiltersSchema.parse(parseSearchParams(rawParams));
  const result = await getUserBookmarks(session.user.id, filters);
  const hasSearch = Boolean(filters.q?.trim());

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "My Bookmarks", path: "/bookmarks" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        My Bookmarks
      </h1>

      <Suspense fallback={null}>
        <BookmarksFilters />
      </Suspense>

      {result.tools.length === 0 && !hasSearch ? (
        <BookmarksEmptyState />
      ) : result.tools.length === 0 ? (
        <EmptyState
          title="No matching bookmarks"
          description="Try a different search term to find saved tools."
        />
      ) : (
        <>
          <ToolsGrid tools={result.tools} />
          {result.totalPages > 1 && (
            <BookmarksPagination
              filters={filters}
              total={result.total}
              totalPages={result.totalPages}
            />
          )}
        </>
      )}
    </div>
  );
}
