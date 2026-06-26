import type { ToolStatus, UserRole } from "@/generated/prisma/client";

export type DashboardStats = {
  totalTools: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
  totalReviews: number;
};

export type RecentTool = {
  id: string;
  name: string;
  slug: string;
  status: ToolStatus;
  createdAt: Date;
  category: { name: string };
};

export type LatestUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export type TopViewedTool = {
  id: string;
  name: string;
  slug: string;
  views: number;
  clicks: number;
  status: ToolStatus;
};

export type ToolAnalyticsRow = {
  id: string;
  name: string;
  slug: string;
  views: number;
  clicks: number;
  ctr: number;
  status: ToolStatus;
};

export type FeaturedToolPerformance = ToolAnalyticsRow & {
  featuredUntil: Date | null;
  sponsored: boolean;
};

export type MonetizationStats = {
  activeFeatured: number;
  activeSponsored: number;
  totalViews: number;
  totalClicks: number;
  averageCtr: number;
};

export type DashboardData = {
  stats: DashboardStats;
  recentTools: RecentTool[];
  latestUsers: LatestUser[];
  topViewedTools: TopViewedTool[];
  topClickedTools: ToolAnalyticsRow[];
  featuredPerformance: FeaturedToolPerformance[];
  monetizationStats: MonetizationStats;
};
