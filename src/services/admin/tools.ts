import type { Prisma } from "@/generated/prisma/client";
import { expireStaleMonetizationListings } from "@/lib/monetization/expire";
import { prisma } from "@/lib/prisma";
import type {
  AdminToolDetail,
  AdminToolFormOptions,
  AdminToolListResult,
} from "@/types/admin-tools";
import type { ToolListFilters } from "@/validations/admin-tools";

function buildWhere(filters: ToolListFilters): Prisma.ToolWhereInput {
  const where: Prisma.ToolWhereInput = {};

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.pricingModel) {
    where.pricingModel = filters.pricingModel;
  }

  if (filters.featured !== undefined) {
    where.featured = filters.featured;
  }

  return where;
}

export async function getAdminTools(
  filters: ToolListFilters,
): Promise<AdminToolListResult> {
  await expireStaleMonetizationListings();

  const where = buildWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;
  const orderBy =
    filters.sort === "views"
      ? ({ views: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      skip,
      take: filters.pageSize,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        pricingModel: true,
        status: true,
        featured: true,
        featuredUntil: true,
        sponsored: true,
        sponsoredUntil: true,
        verified: true,
        views: true,
        clicks: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.tool.count({ where }),
  ]);

  return {
    tools,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function getAdminToolFormOptions(): Promise<AdminToolFormOptions> {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { categories, tags };
}

export async function getAdminToolById(
  id: string,
): Promise<AdminToolDetail | null> {
  const tool = await prisma.tool.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      websiteUrl: true,
      pricingUrl: true,
      logo: true,
      shortDescription: true,
      fullDescription: true,
      categoryId: true,
      pricingModel: true,
      featured: true,
      featuredUntil: true,
      sponsored: true,
      sponsoredUntil: true,
      verified: true,
      status: true,
      metaTitle: true,
      metaDescription: true,
      tags: { select: { tagId: true } },
      images: {
        orderBy: { sortOrder: "asc" },
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
    websiteUrl: tool.websiteUrl,
    pricingUrl: tool.pricingUrl,
    logo: tool.logo,
    shortDescription: tool.shortDescription,
    fullDescription: tool.fullDescription,
    categoryId: tool.categoryId,
    tagIds: tool.tags.map((tag) => tag.tagId),
    images: tool.images,
    pricingModel: tool.pricingModel,
    featured: tool.featured,
    featuredUntil: tool.featuredUntil,
    sponsored: tool.sponsored,
    sponsoredUntil: tool.sponsoredUntil,
    verified: tool.verified,
    status: tool.status,
    metaTitle: tool.metaTitle,
    metaDescription: tool.metaDescription,
  };
}

export async function getAdminToolCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
