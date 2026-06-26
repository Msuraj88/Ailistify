import type { BookmarkFilters } from "@/validations/bookmarks";

export function buildBookmarksHref(
  filters: Partial<BookmarkFilters>,
  options?: { page?: number },
): string {
  const page = options?.page ?? filters.page ?? 1;
  const params = new URLSearchParams();

  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.sort && filters.sort !== "recent") {
    params.set("sort", filters.sort);
  }
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/bookmarks?${query}` : "/bookmarks";
}
