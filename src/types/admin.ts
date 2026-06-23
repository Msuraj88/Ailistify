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

export type DashboardData = {
  stats: DashboardStats;
  recentTools: RecentTool[];
  latestUsers: LatestUser[];
  topViewedTools: TopViewedTool[];
};
