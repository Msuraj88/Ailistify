import { buildToolsDirectoryHref } from "@/lib/directory/url-state";
import type { ToolDirectoryFilters } from "@/validations/directory";

export type PaginationSeoInput = {
  basePath: string;
  filters: ToolDirectoryFilters;
  totalPages: number;
  scoped?: boolean;
};

export type PaginationSeoResult = {
  page: number;
  titleSuffix: string;
  canonicalPath: string;
  prevPath?: string;
  nextPath?: string;
  noIndex: boolean;
};

function hasActiveToolFilters(filters: ToolDirectoryFilters): boolean {
  return Boolean(
    filters.q?.trim() ||
    filters.category ||
    filters.tag ||
    filters.pricing ||
    filters.featured ||
    filters.verified ||
    (filters.sort && filters.sort !== "latest"),
  );
}

export function buildPaginationSeo({
  basePath,
  filters,
  totalPages,
  scoped = false,
}: PaginationSeoInput): PaginationSeoResult {
  const page = filters.page;
  const canonicalPath = buildToolsDirectoryHref(filters, {
    basePath,
    scoped,
    page,
  });

  const prevPath =
    page > 1
      ? buildToolsDirectoryHref(filters, { basePath, scoped, page: page - 1 })
      : undefined;

  const nextPath =
    page < totalPages
      ? buildToolsDirectoryHref(filters, { basePath, scoped, page: page + 1 })
      : undefined;

  return {
    page,
    titleSuffix: page > 1 ? ` — Page ${page}` : "",
    canonicalPath,
    prevPath,
    nextPath,
    noIndex: !scoped && hasActiveToolFilters(filters),
  };
}

export function buildSearchNoIndex(path: string, query?: string): boolean {
  return Boolean(query?.trim());
}
