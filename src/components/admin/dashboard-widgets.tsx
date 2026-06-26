import Link from "next/link";
import {
  FolderTree,
  Megaphone,
  MessageSquare,
  MousePointerClick,
  Star,
  Tags,
  Users,
  Wrench,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCtr } from "@/lib/monetization/analytics";
import type { DashboardData } from "@/types/admin";

type DashboardStatsGridProps = {
  stats: DashboardData["stats"];
  monetizationStats: DashboardData["monetizationStats"];
};

export function DashboardStatsGrid({
  stats,
  monetizationStats,
}: DashboardStatsGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Tools" value={stats.totalTools} icon={Wrench} />
        <StatCard
          title="Total Categories"
          value={stats.totalCategories}
          icon={FolderTree}
        />
        <StatCard title="Total Tags" value={stats.totalTags} icon={Tags} />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Featured"
          value={monetizationStats.activeFeatured}
          icon={Star}
        />
        <StatCard
          title="Active Sponsored"
          value={monetizationStats.activeSponsored}
          icon={Megaphone}
        />
        <StatCard
          title="Total Views"
          value={monetizationStats.totalViews}
          icon={MousePointerClick}
        />
        <StatCard
          title="Average CTR"
          value={formatCtr(
            monetizationStats.totalViews,
            monetizationStats.totalClicks,
          )}
          icon={MousePointerClick}
        />
      </div>
    </div>
  );
}

type DashboardWidgetsProps = {
  recentTools: DashboardData["recentTools"];
  latestUsers: DashboardData["latestUsers"];
  topViewedTools: DashboardData["topViewedTools"];
  topClickedTools: DashboardData["topClickedTools"];
  featuredPerformance: DashboardData["featuredPerformance"];
};

function formatListingExpiry(date: Date | null) {
  if (!date) {
    return "No expiry";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function DashboardWidgets({
  recentTools,
  latestUsers,
  topViewedTools,
  topClickedTools,
  featuredPerformance,
}: DashboardWidgetsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Recently Added Tools</CardTitle>
            <CardDescription>Latest tool submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTools.length === 0 ? (
              <EmptyState
                title="No tools yet"
                description="New tools will appear here once added."
              />
            ) : (
              <ul className="space-y-4">
                {recentTools.map((tool) => (
                  <li
                    key={tool.id}
                    className="flex items-start justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {tool.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tool.category.name}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {tool.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Latest Users</CardTitle>
            <CardDescription>Recently registered accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {latestUsers.length === 0 ? (
              <EmptyState
                title="No users yet"
                description="Registered users will appear here."
              />
            ) : (
              <ul className="space-y-4">
                {latestUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-start justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.name ?? "Unnamed user"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {user.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Most Viewed Tools</CardTitle>
            <CardDescription>Top tools by page views</CardDescription>
          </CardHeader>
          <CardContent>
            {topViewedTools.length === 0 ? (
              <EmptyState
                title="No view data"
                description="Tool view metrics will appear here."
              />
            ) : (
              <ul className="space-y-4">
                {topViewedTools.map((tool) => (
                  <li
                    key={tool.id}
                    className="flex items-start justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/tools/${tool.id}/edit`}
                        className="truncate text-sm font-medium hover:text-primary"
                      >
                        {tool.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {tool.clicks.toLocaleString()} clicks ·{" "}
                        {formatCtr(tool.views, tool.clicks)} CTR
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {tool.views.toLocaleString()} views
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Clicked Tools</CardTitle>
            <CardDescription>
              Outbound clicks from directory listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topClickedTools.length === 0 ? (
              <EmptyState
                title="No click data"
                description="Tool click metrics will appear here."
              />
            ) : (
              <ul className="space-y-4">
                {topClickedTools.map((tool) => (
                  <li
                    key={tool.id}
                    className="flex items-start justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {tool.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tool.views.toLocaleString()} views ·{" "}
                        {tool.ctr.toFixed(2)}% CTR
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {tool.clicks.toLocaleString()} clicks
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Featured Performance</CardTitle>
            <CardDescription>
              Active featured listings and their engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {featuredPerformance.length === 0 ? (
              <EmptyState
                title="No featured tools"
                description="Featured listing performance will appear here."
              />
            ) : (
              <ul className="space-y-4">
                {featuredPerformance.map((tool) => (
                  <li
                    key={tool.id}
                    className="flex items-start justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {tool.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Until {formatListingExpiry(tool.featuredUntil)} ·{" "}
                        {tool.views.toLocaleString()} views ·{" "}
                        {tool.clicks.toLocaleString()} clicks ·{" "}
                        {tool.ctr.toFixed(2)}% CTR
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {tool.sponsored && (
                        <Badge className="text-xs">Sponsored</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Featured
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
