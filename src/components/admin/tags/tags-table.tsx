"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteTagDialog } from "@/components/admin/tags/delete-tag-dialog";
import { TagFormDialog } from "@/components/admin/tags/tag-form-dialog";
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
import type { AdminTagListItem } from "@/types/admin-tags";

type TagsTableProps = {
  tags: AdminTagListItem[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function TagsTable({ tags }: TagsTableProps) {
  if (tags.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm font-medium">No tags found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search or create a new tag.
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
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TagRow({ tag }: { tag: AdminTagListItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{tag.name}</TableCell>
        <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
        <TableCell className="max-w-xs truncate text-muted-foreground">
          {tag.description ?? "—"}
        </TableCell>
        <TableCell className="text-right">
          <Badge variant={tag.toolCount > 0 ? "default" : "secondary"}>
            {tag.toolCount}
          </Badge>
        </TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground">
          {formatDate(tag.createdAt)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {tag.name}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete {tag.name}</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <TagFormDialog open={editOpen} onOpenChange={setEditOpen} tag={tag} />

      <DeleteTagDialog
        tagId={tag.id}
        tagName={tag.name}
        toolCount={tag.toolCount}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
