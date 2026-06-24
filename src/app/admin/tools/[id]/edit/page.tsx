import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ToolForm } from "@/components/admin/tools/tool-form";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";
import {
  getAdminToolById,
  getAdminToolFormOptions,
} from "@/services/admin/tools";

type EditAdminToolPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditAdminToolPageProps) {
  const { id } = await params;
  const tool = await getAdminToolById(id);

  return createMetadata({
    title: tool ? `Edit ${tool.name}` : "Edit Tool",
    description: "Update an AI tool listing in the admin.",
  });
}

export default async function EditAdminToolPage({
  params,
}: EditAdminToolPageProps) {
  const { id } = await params;

  const [tool, options] = await Promise.all([
    getAdminToolById(id),
    getAdminToolFormOptions(),
  ]);

  if (!tool) {
    notFound();
  }

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
            Edit tool
          </h1>
          <p className="mt-1 text-muted-foreground">
            Update details for <span className="font-medium">{tool.name}</span>.
          </p>
        </div>
      </div>

      <ToolForm mode="edit" options={options} tool={tool} />
    </div>
  );
}
