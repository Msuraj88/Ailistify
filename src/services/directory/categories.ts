import { prisma } from "@/lib/prisma";
import type { DirectoryCategoryCard } from "@/types/directory";
import { PUBLISHED_TOOL_WHERE } from "@/services/directory/shared";
import type { DirectorySearchFilters } from "@/validations/directory";

function buildWhere(filters: DirectorySearchFilters = {}) {
  if (!filters.q?.trim()) {
    return {};
  }

  const q = filters.q.trim();
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { slug: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

export async function getDirectoryCategories(
  filters: DirectorySearchFilters = {},
  limit?: number,
): Promise<DirectoryCategoryCard[]> {
  const categories = await prisma.category.findMany({
    where: buildWhere(filters),
    orderBy: { name: "asc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          tools: { where: PUBLISHED_TOOL_WHERE },
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    toolCount: category._count.tools,
  }));
}

export async function getPopularDirectoryCategories(
  limit = 6,
): Promise<DirectoryCategoryCard[]> {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          tools: { where: PUBLISHED_TOOL_WHERE },
        },
      },
    },
  });

  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      toolCount: category._count.tools,
    }))
    .filter((category) => category.toolCount > 0)
    .sort((a, b) => b.toolCount - a.toolCount)
    .slice(0, limit);
}

export async function getDirectoryCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          tools: { where: PUBLISHED_TOOL_WHERE },
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    toolCount: category._count.tools,
  };
}
