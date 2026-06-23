import { FolderTree, MessageSquare, Tags, Users, Wrench } from "lucide-react";
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
import type { DashboardData } from "@/types/admin";

type DashboardStatsGridProps = {
  stats: DashboardData["stats"];
};

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
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
  );
}

type DashboardWidgetsProps = {
  recentTools: DashboardData["recentTools"];
  latestUsers: DashboardData["latestUsers"];
  topViewedTools: DashboardData["topViewedTools"];
};

export function DashboardWidgets({
  recentTools,
  latestUsers,
  topViewedTools,
}: DashboardWidgetsProps) {
  return (
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
                    <p className="truncate text-sm font-medium">{tool.name}</p>
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
                    <p className="truncate text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tool.clicks.toLocaleString()} clicks
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
  );
}
