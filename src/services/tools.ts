import { prisma } from "@/lib/prisma";
import type { Tool } from "@/types";

export async function getPublishedTools(limit?: number): Promise<Tool[]> {
  return prisma.tool.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getFeaturedTools(limit = 6): Promise<Tool[]> {
  return prisma.tool.findMany({
    where: { published: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  return prisma.tool.findUnique({
    where: { slug, published: true },
  });
}

export async function getToolsByCategory(
  category: string,
  limit?: number,
): Promise<Tool[]> {
  return prisma.tool.findMany({
    where: { published: true, category },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
