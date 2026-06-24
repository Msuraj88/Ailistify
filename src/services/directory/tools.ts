import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  DirectoryToolDetail,
  DirectoryToolListResult,
  DirectoryToolCard,
} from "@/types/directory";
import type { ToolDirectoryFilters } from "@/validations/directory";
import {
  mapToolCard,
  PUBLISHED_TOOL_WHERE,
  toolCardSelect,
} from "@/services/directory/shared";

function buildWhere(filters: ToolDirectoryFilters): Prisma.ToolWhereInput {
  const where: Prisma.ToolWhereInput = { ...PUBLISHED_TOOL_WHERE };

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.tag) {
    where.tags = { some: { tag: { slug: filters.tag } } };
  }

  if (filters.pricing) {
    where.pricingModel = filters.pricing;
  }

  return where;
}

function buildOrderBy(
  sort: ToolDirectoryFilters["sort"],
): Prisma.ToolOrderByWithRelationInput[] {
  switch (sort) {
    case "views":
      return [{ views: "desc" }, { createdAt: "desc" }];
    case "featured":
      return [{ featured: "desc" }, { views: "desc" }, { createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function getDirectoryTools(
  filters: ToolDirectoryFilters,
): Promise<DirectoryToolListResult> {
  const where = buildWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;
  const orderBy = buildOrderBy(filters.sort);

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      skip,
      take: filters.pageSize,
      orderBy,
      select: toolCardSelect,
    }),
    prisma.tool.count({ where }),
  ]);

  return {
    tools: tools.map(mapToolCard),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function getDirectoryToolBySlug(
  slug: string,
): Promise<DirectoryToolDetail | null> {
  const tool = await prisma.tool.findFirst({
    where: { slug, ...PUBLISHED_TOOL_WHERE },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      websiteUrl: true,
      pricingUrl: true,
      shortDescription: true,
      fullDescription: true,
      pricingModel: true,
      featured: true,
      verified: true,
      views: true,
      metaTitle: true,
      metaDescription: true,
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        select: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          imageUrl: true,
          altText: true,
          caption: true,
          sortOrder: true,
          isPrimary: true,
        },
      },
    },
  });

  if (!tool) {
    return null;
  }

  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    logo: tool.logo,
    websiteUrl: tool.websiteUrl,
    pricingUrl: tool.pricingUrl,
    shortDescription: tool.shortDescription,
    fullDescription: tool.fullDescription,
    pricingModel: tool.pricingModel,
    featured: tool.featured,
    verified: tool.verified,
    views: tool.views,
    metaTitle: tool.metaTitle,
    metaDescription: tool.metaDescription,
    category: tool.category,
    tags: tool.tags.map((entry) => entry.tag),
    images: tool.images,
  };
}

export async function getRelatedTools(
  toolId: string,
  categoryId: string,
  limit = 4,
): Promise<DirectoryToolCard[]> {
  const tools = await prisma.tool.findMany({
    where: {
      ...PUBLISHED_TOOL_WHERE,
      categoryId,
      id: { not: toolId },
    },
    take: limit,
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    select: toolCardSelect,
  });

  return tools.map(mapToolCard);
}

export async function getFeaturedDirectoryTools(
  limit = 6,
): Promise<DirectoryToolCard[]> {
  const tools = await prisma.tool.findMany({
    where: { ...PUBLISHED_TOOL_WHERE, featured: true },
    take: limit,
    orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    select: toolCardSelect,
  });

  return tools.map(mapToolCard);
}

export async function getLatestDirectoryTools(
  limit = 6,
): Promise<DirectoryToolCard[]> {
  const tools = await prisma.tool.findMany({
    where: PUBLISHED_TOOL_WHERE,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: toolCardSelect,
  });

  return tools.map(mapToolCard);
}

export async function getPopularSearchTools(limit = 4) {
  const tools = await prisma.tool.findMany({
    where: PUBLISHED_TOOL_WHERE,
    take: limit,
    orderBy: { views: "desc" },
    select: { name: true, slug: true },
  });

  return tools;
}

export async function getDirectoryFilterOptions() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            tools: { where: PUBLISHED_TOOL_WHERE },
          },
        },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            tools: {
              where: { tool: PUBLISHED_TOOL_WHERE },
            },
          },
        },
      },
    }),
  ]);

  return {
    categories: categories
      .filter((c) => c._count.tools > 0)
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        toolCount: c._count.tools,
      })),
    tags: tags
      .filter((t) => t._count.tools > 0)
      .map((t) => ({
        name: t.name,
        slug: t.slug,
        toolCount: t._count.tools,
      })),
  };
}
