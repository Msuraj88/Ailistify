"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminCategoryListItem } from "@/types/admin-categories";

type CategoriesManagerProps = {
  categories: AdminCategoryListItem[];
};

function SearchSkeleton() {
  return <Skeleton className="h-10 w-full" />;
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-muted-foreground">
            Organize tools into browsable categories.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <AdminSearchBar
          basePath="/admin/categories"
          placeholder="Search categories by name, slug, or description..."
        />
      </Suspense>

      <CategoriesTable categories={categories} />

      <CategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
