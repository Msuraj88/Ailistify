import { prisma } from "@/lib/prisma";
import type { DirectoryTagCard } from "@/types/directory";
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

export async function getDirectoryTags(
  filters: DirectorySearchFilters = {},
  limit?: number,
): Promise<DirectoryTagCard[]> {
  const tags = await prisma.tag.findMany({
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
          tools: {
            where: { tool: PUBLISHED_TOOL_WHERE },
          },
        },
      },
    },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    toolCount: tag._count.tools,
  }));
}

export async function getPopularDirectoryTags(
  limit = 12,
): Promise<DirectoryTagCard[]> {
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          tools: {
            where: { tool: PUBLISHED_TOOL_WHERE },
          },
        },
      },
    },
  });

  return tags
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      toolCount: tag._count.tools,
    }))
    .filter((tag) => tag.toolCount > 0)
    .sort((a, b) => b.toolCount - a.toolCount)
    .slice(0, limit);
}

export async function getDirectoryTagBySlug(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      _count: {
        select: {
          tools: {
            where: { tool: PUBLISHED_TOOL_WHERE },
          },
        },
      },
    },
  });

  if (!tag) {
    return null;
  }

  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    metaTitle: tag.metaTitle,
    metaDescription: tag.metaDescription,
    toolCount: tag._count.tools,
  };
}
