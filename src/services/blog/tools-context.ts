import { ToolStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type BlogToolContext = {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  websiteUrl: string;
  pricingModel: string;
  verified: boolean;
  featured: boolean;
  category: string;
  tags: string[];
};

function extractSearchTerms(prompt: string): string[] {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 20);
}

export async function getPublishedToolsForBlogContext(
  prompt: string,
  limit = 60,
): Promise<BlogToolContext[]> {
  const terms = extractSearchTerms(prompt);

  const tools = await prisma.tool.findMany({
    where: {
      status: ToolStatus.PUBLISHED,
      ...(terms.length > 0
        ? {
            OR: terms.flatMap((term) => [
              { name: { contains: term, mode: "insensitive" as const } },
              {
                shortDescription: {
                  contains: term,
                  mode: "insensitive" as const,
                },
              },
              {
                fullDescription: {
                  contains: term,
                  mode: "insensitive" as const,
                },
              },
            ]),
          }
        : {}),
    },
    select: {
      name: true,
      slug: true,
      shortDescription: true,
      fullDescription: true,
      websiteUrl: true,
      pricingModel: true,
      verified: true,
      featured: true,
      category: { select: { name: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
    orderBy: [{ featured: "desc" }, { verified: "desc" }, { views: "desc" }],
    take: limit,
  });

  if (tools.length > 0) {
    return tools.map((tool) => ({
      name: tool.name,
      slug: tool.slug,
      shortDescription: tool.shortDescription,
      fullDescription: tool.fullDescription.slice(0, 600),
      websiteUrl: tool.websiteUrl,
      pricingModel: tool.pricingModel,
      verified: tool.verified,
      featured: tool.featured,
      category: tool.category.name,
      tags: tool.tags.map((entry) => entry.tag.name),
    }));
  }

  const fallback = await prisma.tool.findMany({
    where: { status: ToolStatus.PUBLISHED },
    select: {
      name: true,
      slug: true,
      shortDescription: true,
      fullDescription: true,
      websiteUrl: true,
      pricingModel: true,
      verified: true,
      featured: true,
      category: { select: { name: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    take: limit,
  });

  return fallback.map((tool) => ({
    name: tool.name,
    slug: tool.slug,
    shortDescription: tool.shortDescription,
    fullDescription: tool.fullDescription.slice(0, 600),
    websiteUrl: tool.websiteUrl,
    pricingModel: tool.pricingModel,
    verified: tool.verified,
    featured: tool.featured,
    category: tool.category.name,
    tags: tool.tags.map((entry) => entry.tag.name),
  }));
}

export function formatToolsForBlogPrompt(tools: BlogToolContext[]): string {
  if (tools.length === 0) {
    return "No published tools available in the database.";
  }

  return tools
    .map(
      (tool) =>
        `- ${tool.name} (slug: ${tool.slug}, category: ${tool.category}, pricing: ${tool.pricingModel}, verified: ${tool.verified}, featured: ${tool.featured})
  Website: ${tool.websiteUrl}
  Summary: ${tool.shortDescription}
  Tags: ${tool.tags.join(", ") || "none"}`,
    )
    .join("\n\n");
}
