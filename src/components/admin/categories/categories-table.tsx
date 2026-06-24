"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/admin/categories/delete-category-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCategoryListItem } from "@/types/admin-categories";

type CategoriesTableProps = {
  categories: AdminCategoryListItem[];
};

export function CategoriesTable({ categories }: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm font-medium">No categories found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search or create a new category.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Tools</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CategoryRow({ category }: { category: AdminCategoryListItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{category.name}</TableCell>
        <TableCell className="text-muted-foreground">{category.slug}</TableCell>
        <TableCell className="max-w-xs truncate text-muted-foreground">
          {category.description}
        </TableCell>
        <TableCell className="text-right">
          <Badge variant={category.toolCount > 0 ? "default" : "secondary"}>
            {category.toolCount}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {category.name}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete {category.name}</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <CategoryFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        category={category}
      />

      <DeleteCategoryDialog
        categoryId={category.id}
        categoryName={category.name}
        toolCount={category.toolCount}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
