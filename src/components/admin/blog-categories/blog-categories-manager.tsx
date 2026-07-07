"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteBlogCategory } from "@/actions/admin/blog-categories";
import { BlogCategoryFormDialog } from "@/components/admin/blog-categories/blog-category-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminBlogCategoryListItem } from "@/types/admin-blog";

type BlogCategoriesManagerProps = {
  categories: AdminBlogCategoryListItem[];
};

export function BlogCategoriesManager({
  categories,
}: BlogCategoriesManagerProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBlogCategoryListItem | null>(
    null,
  );

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this blog category?")) {
      return;
    }

    const result = await deleteBlogCategory(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Category deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Blog Categories
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage categories for AI Content Studio blog posts.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.postCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BlogCategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => router.refresh()}
      />

      <BlogCategoryFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        category={editing}
        onSuccess={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </div>
  );
}
