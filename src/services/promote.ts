import { prisma } from "@/lib/prisma";
import { PUBLISHED_TOOL_WHERE } from "@/services/directory/shared";

export async function getPromotePageStats() {
  const [totalTools, aggregates] = await Promise.all([
    prisma.tool.count({ where: PUBLISHED_TOOL_WHERE }),
    prisma.tool.aggregate({
      where: PUBLISHED_TOOL_WHERE,
      _sum: { views: true },
    }),
  ]);

  return {
    totalTools,
    totalViews: aggregates._sum.views ?? 0,
  };
}
