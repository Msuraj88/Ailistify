import Link from "next/link";
import { Plus } from "lucide-react";
import { MyToolsList } from "@/components/submit-tool/my-tools-list";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/session";
import { createSeoMetadata } from "@/lib/metadata";
import { getMySubmittedTools } from "@/services/my-tools";

export const metadata = createSeoMetadata({
  title: "My Tools",
  description: "Manage your AIListify tool submissions and review queue.",
  path: "/my-tools",
  noIndex: true,
});

export default async function MyToolsPage() {
  const session = await requireAuth("/my-tools");
  const tools = await getMySubmittedTools(session.user.id);

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "My Tools", path: "/my-tools" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Tools
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your submissions, edit queued tools, and upgrade to premium
            launch.
          </p>
        </div>
        <Button asChild>
          <Link href="/my-tools/submit">
            <Plus className="h-4 w-4" />
            Submit Tool
          </Link>
        </Button>
      </div>

      <MyToolsList tools={tools} />
    </div>
  );
}
