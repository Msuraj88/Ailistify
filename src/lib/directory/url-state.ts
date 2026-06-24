import type { ToolDirectoryFilters } from "@/validations/directory";

export function buildToolsDirectoryHref(
  filters: Partial<ToolDirectoryFilters>,
  options?: { basePath?: string; page?: number; scoped?: boolean },
): string {
  const basePath = options?.basePath ?? "/tools";
  const scoped = options?.scoped ?? false;
  const page = options?.page ?? filters.page ?? 1;
  const params = new URLSearchParams();

  if (!scoped) {
    if (filters.q?.trim()) params.set("q", filters.q.trim());
    if (filters.category) params.set("category", filters.category);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.pricing) params.set("pricing", filters.pricing);
    if (filters.featured === true) params.set("featured", "true");
    if (filters.verified === true) params.set("verified", "true");
    if (filters.sort && filters.sort !== "latest") {
      params.set("sort", filters.sort);
    }
  }

  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}
