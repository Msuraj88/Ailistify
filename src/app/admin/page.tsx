import { requireAdmin } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = createMetadata({
  title: "Admin Dashboard",
  description: "AIListify admin dashboard.",
});

export default async function AdminPage() {
  const session = await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-3">
          Admin
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
            <CardDescription>Manage AI tool listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review pending submissions, feature tools, and manage categories.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts and roles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View registered users and assign moderator or admin roles.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Platform insights and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track views, clicks, and engagement across the directory.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
