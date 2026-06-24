import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ToolForm } from "@/components/admin/tools/tool-form";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";
import { getAdminToolFormOptions } from "@/services/admin/tools";

export const metadata = createMetadata({
  title: "Add Tool",
  description: "Create a new AI tool listing in the admin.",
});

export default async function NewAdminToolPage() {
  const options = await getAdminToolFormOptions();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/tools">
            <ChevronLeft className="h-4 w-4" />
            Back to tools
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Add tool
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create a new AI tool listing for the directory.
          </p>
        </div>
      </div>

      <ToolForm mode="create" options={options} />
    </div>
  );
}
