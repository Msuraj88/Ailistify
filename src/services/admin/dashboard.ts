import { ToolStatus } from "@/generated/prisma/client";
import { calculateCtr } from "@/lib/monetization/analytics";
import { expireStaleMonetizationListings } from "@/lib/monetization/listings";
import { prisma } from "@/lib/prisma";
import type {
  DashboardData,
  DashboardStats,
  FeaturedToolPerformance,
  LatestUser,
  MonetizationStats,
  RecentTool,
  ToolAnalyticsRow,
  TopViewedTool,
} from "@/types/admin";

function mapAnalyticsRow(tool: {
  id: string;
  name: string;
  slug: string;
  views: number;
  clicks: number;
  status: ToolStatus;
}): ToolAnalyticsRow {
  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    views: tool.views,
    clicks: tool.clicks,
    ctr: calculateCtr(tool.views, tool.clicks),
    status: tool.status,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalTools, totalCategories, totalTags, totalUsers, totalReviews] =
    await Promise.all([
      prisma.tool.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.user.count(),
      prisma.review.count(),
    ]);

  return {
    totalTools,
    totalCategories,
    totalTags,
    totalUsers,
    totalReviews,
  };
}

export async function getRecentlyAddedTools(limit = 5): Promise<RecentTool[]> {
  return prisma.tool.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  });
}

export async function getLatestUsers(limit = 5): Promise<LatestUser[]> {
  return prisma.user.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getMostViewedTools(limit = 5): Promise<TopViewedTool[]> {
  return prisma.tool.findMany({
    take: limit,
    orderBy: { views: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      views: true,
      clicks: true,
      status: true,
    },
  });
}

export async function getTopClickedTools(
  limit = 5,
): Promise<ToolAnalyticsRow[]> {
  const tools = await prisma.tool.findMany({
    take: limit,
    orderBy: [{ clicks: "desc" }, { views: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      views: true,
      clicks: true,
      status: true,
    },
  });

  return tools.map(mapAnalyticsRow);
}

export async function getFeaturedToolPerformance(
  limit = 5,
): Promise<FeaturedToolPerformance[]> {
  const tools = await prisma.tool.findMany({
    where: { featured: true },
    take: limit,
    orderBy: [{ views: "desc" }, { clicks: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      views: true,
      clicks: true,
      status: true,
      featuredUntil: true,
      sponsored: true,
    },
  });

  return tools.map((tool) => ({
    ...mapAnalyticsRow(tool),
    featuredUntil: tool.featuredUntil,
    sponsored: tool.sponsored,
  }));
}

export async function getMonetizationStats(): Promise<MonetizationStats> {
  const now = new Date();

  const [activeFeatured, activeSponsored, aggregates] = await Promise.all([
    prisma.tool.count({
      where: {
        featured: true,
        OR: [{ featuredUntil: null }, { featuredUntil: { gt: now } }],
      },
    }),
    prisma.tool.count({
      where: {
        sponsored: true,
        OR: [{ sponsoredUntil: null }, { sponsoredUntil: { gt: now } }],
      },
    }),
    prisma.tool.aggregate({
      _sum: { views: true, clicks: true },
    }),
  ]);

  const totalViews = aggregates._sum.views ?? 0;
  const totalClicks = aggregates._sum.clicks ?? 0;

  return {
    activeFeatured,
    activeSponsored,
    totalViews,
    totalClicks,
    averageCtr: calculateCtr(totalViews, totalClicks),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  await expireStaleMonetizationListings();

  const [
    stats,
    recentTools,
    latestUsers,
    topViewedTools,
    topClickedTools,
    featuredPerformance,
    monetizationStats,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentlyAddedTools(),
    getLatestUsers(),
    getMostViewedTools(),
    getTopClickedTools(),
    getFeaturedToolPerformance(),
    getMonetizationStats(),
  ]);

  return {
    stats,
    recentTools,
    latestUsers,
    topViewedTools,
    topClickedTools,
    featuredPerformance,
    monetizationStats,
  };
}
