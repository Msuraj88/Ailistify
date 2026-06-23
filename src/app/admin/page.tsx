import {
  DashboardStatsGrid,
  DashboardWidgets,
} from "@/components/admin/dashboard-widgets";
import { getDashboardData } from "@/services/admin/dashboard";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Admin Dashboard",
  description: "AIListify admin dashboard overview.",
});

export default async function AdminDashboardPage() {
  const { stats, recentTools, latestUsers, topViewedTools } =
    await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your AI tools directory
        </p>
      </div>

      <DashboardStatsGrid stats={stats} />

      <DashboardWidgets
        recentTools={recentTools}
        latestUsers={latestUsers}
        topViewedTools={topViewedTools}
      />
    </div>
  );
}
