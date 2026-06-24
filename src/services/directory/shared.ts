import type { Prisma } from "@/generated/prisma/client";
import { ToolStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { DirectoryToolCard } from "@/types/directory";

export const PUBLISHED_TOOL_WHERE = {
  status: ToolStatus.PUBLISHED,
} as const satisfies Prisma.ToolWhereInput;

export const toolCardSelect = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  shortDescription: true,
  pricingModel: true,
  featured: true,
  verified: true,
  views: true,
  category: { select: { name: true, slug: true } },
  tags: {
    select: {
      tag: { select: { name: true, slug: true } },
    },
  },
} as const;

export function mapToolCard(
  tool: Prisma.ToolGetPayload<{ select: typeof toolCardSelect }>,
): DirectoryToolCard {
  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    logo: tool.logo,
    shortDescription: tool.shortDescription,
    pricingModel: tool.pricingModel,
    featured: tool.featured,
    verified: tool.verified,
    views: tool.views,
    category: tool.category,
    tags: tool.tags.map((entry) => entry.tag),
  };
}

export async function getPublishedToolCount(): Promise<number> {
  return prisma.tool.count({ where: PUBLISHED_TOOL_WHERE });
}
