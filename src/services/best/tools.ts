import { PricingModel } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  mapToolCard,
  PUBLISHED_TOOL_WHERE,
  toolCardSelect,
} from "@/services/directory/shared";
import type { BestResolvedTool } from "@/types/best";

const FREE_PLAN_MODELS = new Set<PricingModel>([
  PricingModel.FREE,
  PricingModel.FREEMIUM,
]);

/**
 * Resolve ordered tool slugs from the AIListify directory at build time.
 * Missing / unpublished slugs are skipped without throwing.
 */
export async function resolveBestToolsBySlugs(
  slugs: string[],
): Promise<BestResolvedTool[]> {
  const uniqueSlugs = [
    ...new Set(slugs.map((slug) => slug.trim()).filter(Boolean)),
  ];

  if (uniqueSlugs.length === 0) {
    return [];
  }

  const tools = await prisma.tool.findMany({
    where: {
      ...PUBLISHED_TOOL_WHERE,
      slug: { in: uniqueSlugs },
    },
    select: {
      ...toolCardSelect,
      websiteUrl: true,
    },
  });

  const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));
  const ordered = uniqueSlugs
    .map((slug) => toolsBySlug.get(slug))
    .filter((tool): tool is NonNullable<typeof tool> => tool != null);

  if (ordered.length === 0) {
    return [];
  }

  const toolIds = ordered.map((tool) => tool.id);

  const ratingGroups = await prisma.review.groupBy({
    by: ["toolId"],
    where: { toolId: { in: toolIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const ratingsByToolId = new Map(
    ratingGroups.map((group) => [
      group.toolId,
      {
        averageRating:
          group._avg.rating != null
            ? Math.round(group._avg.rating * 10) / 10
            : null,
        reviewCount: group._count._all,
      },
    ]),
  );

  return ordered.map((tool) => {
    const card = mapToolCard(tool);
    const rating = ratingsByToolId.get(tool.id);

    return {
      ...card,
      websiteUrl: tool.websiteUrl,
      averageRating: rating?.averageRating ?? null,
      reviewCount: rating?.reviewCount ?? 0,
      hasFreePlan: FREE_PLAN_MODELS.has(tool.pricingModel),
    };
  });
}

export function splitFreeAndPaidTools(tools: BestResolvedTool[]): {
  freeTools: BestResolvedTool[];
  paidTools: BestResolvedTool[];
} {
  return {
    freeTools: tools.filter((tool) => tool.hasFreePlan),
    paidTools: tools.filter((tool) => !tool.hasFreePlan),
  };
}
