import { prisma } from "@/lib/prisma";
import { ToolStatus } from "@/generated/prisma/client";
import type { Tool } from "@/types";

const publishedWhere = { status: ToolStatus.PUBLISHED } as const;

export async function getPublishedTools(limit?: number): Promise<Tool[]> {
  return prisma.tool.findMany({
    where: publishedWhere,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getFeaturedTools(limit = 6): Promise<Tool[]> {
  return prisma.tool.findMany({
    where: { ...publishedWhere, featured: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  return prisma.tool.findFirst({
    where: { slug, status: ToolStatus.PUBLISHED },
    include: { category: true, images: true, reviews: true },
  });
}

export async function getToolsByCategory(
  categorySlug: string,
  limit?: number,
): Promise<Tool[]> {
  return prisma.tool.findMany({
    where: {
      status: ToolStatus.PUBLISHED,
      category: { slug: categorySlug },
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
