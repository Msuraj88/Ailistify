import { prisma } from "@/lib/prisma";
import type {
  DashboardData,
  DashboardStats,
  LatestUser,
  RecentTool,
  TopViewedTool,
} from "@/types/admin";

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

export async function getDashboardData(): Promise<DashboardData> {
  const [stats, recentTools, latestUsers, topViewedTools] = await Promise.all([
    getDashboardStats(),
    getRecentlyAddedTools(),
    getLatestUsers(),
    getMostViewedTools(),
  ]);

  return { stats, recentTools, latestUsers, topViewedTools };
}
