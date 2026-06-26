import type { Prisma } from "@/generated/prisma/client";
import type { ToolDirectoryFilters } from "@/validations/directory";
import { PUBLISHED_TOOL_WHERE } from "@/services/directory/shared";

function buildSearchClause(query: string): Prisma.ToolWhereInput {
  return {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
      { fullDescription: { contains: query, mode: "insensitive" } },
      {
        tags: {
          some: {
            tag: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        },
      },
    ],
  };
}

export function buildToolDirectoryWhere(
  filters: ToolDirectoryFilters,
): Prisma.ToolWhereInput {
  const and: Prisma.ToolWhereInput[] = [PUBLISHED_TOOL_WHERE];

  const query = filters.q?.trim();
  if (query) {
    and.push(buildSearchClause(query));
  }

  if (filters.category) {
    and.push({ category: { slug: filters.category } });
  }

  if (filters.tag) {
    and.push({ tags: { some: { tag: { slug: filters.tag } } } });
  }

  if (filters.pricing) {
    and.push({ pricingModel: filters.pricing });
  }

  if (filters.featured === true) {
    and.push({
      featured: true,
      OR: [{ featuredUntil: null }, { featuredUntil: { gt: new Date() } }],
    });
  }

  if (filters.verified === true) {
    and.push({ verified: true });
  }

  return and.length === 1 ? and[0]! : { AND: and };
}

export function buildToolDirectoryOrderBy(
  sort: ToolDirectoryFilters["sort"],
): Prisma.ToolOrderByWithRelationInput[] {
  switch (sort) {
    case "views":
      return [{ views: "desc" }, { createdAt: "desc" }];
    case "clicks":
      return [{ clicks: "desc" }, { views: "desc" }];
    case "name":
      return [{ name: "asc" }];
    default:
      return [
        { sponsored: "desc" },
        { featured: "desc" },
        { createdAt: "desc" },
      ];
  }
}
