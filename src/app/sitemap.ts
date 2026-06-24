import type { MetadataRoute } from "next";
import { ToolStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, categories, tags] = await Promise.all([
    prisma.tool.findMany({
      where: { status: ToolStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      select: { slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/tools"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/categories"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/tags"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: absoluteUrl(`/tools/${tool.slug}`),
    lastModified: tool.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: absoluteUrl(`/tag/${tag.slug}`),
    lastModified: tag.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...categoryRoutes, ...tagRoutes];
}
