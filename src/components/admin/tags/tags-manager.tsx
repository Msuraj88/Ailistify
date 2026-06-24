"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { TagFormDialog } from "@/components/admin/tags/tag-form-dialog";
import { TagsTable } from "@/components/admin/tags/tags-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminTagListItem } from "@/types/admin-tags";

type TagsManagerProps = {
  tags: AdminTagListItem[];
};

function SearchSkeleton() {
  return <Skeleton className="h-10 w-full" />;
}

export function TagsManager({ tags }: TagsManagerProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tags
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage tags for filtering and SEO landing pages.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add tag
        </Button>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <AdminSearchBar
          basePath="/admin/tags"
          placeholder="Search tags by name, slug, or description..."
        />
      </Suspense>

      <TagsTable tags={tags} />

      <TagFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
