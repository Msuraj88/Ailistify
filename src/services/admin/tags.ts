import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminTagDetail, AdminTagListItem } from "@/types/admin-tags";
import type { TagListFilters } from "@/validations/admin-tags";

function buildWhere(filters: TagListFilters): Prisma.TagWhereInput {
  if (!filters.q?.trim()) {
    return {};
  }

  const q = filters.q.trim();
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ],
  };
}

export async function getAdminTags(
  filters: TagListFilters = {},
): Promise<AdminTagListItem[]> {
  const tags = await prisma.tag.findMany({
    where: buildWhere(filters),
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      createdAt: true,
      _count: { select: { tools: true } },
    },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    metaTitle: tag.metaTitle,
    metaDescription: tag.metaDescription,
    toolCount: tag._count.tools,
    createdAt: tag.createdAt,
  }));
}

export async function getAdminTagById(
  id: string,
): Promise<AdminTagDetail | null> {
  return prisma.tag.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
    },
  });
}

export async function getTagToolCount(id: string): Promise<number> {
  return prisma.toolTag.count({ where: { tagId: id } });
}
