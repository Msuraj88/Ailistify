import { withDbRetry } from "@/lib/db/retry";
import { expireStaleMonetizationListings } from "@/lib/monetization/listings";
import { prisma } from "@/lib/prisma";
import { getPopularDirectoryCategories } from "@/services/directory/categories";
import {
  mapToolCard,
  PUBLISHED_TOOL_WHERE,
  toolCardSelect,
} from "@/services/directory/shared";
import type { HomePageData } from "@/types/directory";

export async function getHomePageData(): Promise<HomePageData> {
  return withDbRetry(async () => {
    await expireStaleMonetizationListings();

    const [totalTools, featuredTools, latestTools, popularCategories] =
      await Promise.all([
        prisma.tool.count({ where: PUBLISHED_TOOL_WHERE }),
        prisma.tool.findMany({
          where: { ...PUBLISHED_TOOL_WHERE, featured: true },
          take: 6,
          orderBy: [{ views: "desc" }, { createdAt: "desc" }],
          select: toolCardSelect,
        }),
        prisma.tool.findMany({
          where: PUBLISHED_TOOL_WHERE,
          take: 6,
          orderBy: { createdAt: "desc" },
          select: toolCardSelect,
        }),
        getPopularDirectoryCategories(6),
      ]);

    return {
      totalTools,
      featuredTools: featuredTools.map(mapToolCard),
      latestTools: latestTools.map(mapToolCard),
      popularCategories,
    };
  });
}
