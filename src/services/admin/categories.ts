import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AdminCategoryDetail,
  AdminCategoryListItem,
} from "@/types/admin-categories";
import type { CategoryListFilters } from "@/validations/admin-categories";

function buildWhere(filters: CategoryListFilters): Prisma.CategoryWhereInput {
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

export async function getAdminCategories(
  filters: CategoryListFilters = {},
): Promise<AdminCategoryListItem[]> {
  const categories = await prisma.category.findMany({
    where: buildWhere(filters),
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { tools: true } },
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

export async function getAdminCategoryById(
  id: string,
): Promise<AdminCategoryDetail | null> {
  return prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });
}

export async function getCategoryToolCount(id: string): Promise<number> {
  return prisma.tool.count({ where: { categoryId: id } });
}
