"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAdminBlog, duplicateAdminBlog } from "@/actions/admin/blog";
import { BlogStatusBadge } from "@/components/admin/blog/blog-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import type { AdminBlogListItem } from "@/types/admin-blog";

type BlogsTableProps = {
  blogs: AdminBlogListItem[];
};

function formatDate(date: Date | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function BlogsTable({ blogs }: BlogsTableProps) {
  const router = useRouter();

  async function handleDuplicate(id: string) {
    const result = await duplicateAdminBlog(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Blog duplicated.");
    router.push(`/admin/content/blogs/${result.data.id}/edit`);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this blog post?")) {
      return;
    }

    const result = await deleteAdminBlog(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Blog deleted.");
    router.refresh();
  }

  if (blogs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        No blog posts yet. Create your first SEO blog with AI.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Featured Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog) => (
            <TableRow key={blog.id}>
              <TableCell>
                {blog.featuredImage ? (
                  <Image
                    src={buildImageKitUrl(blog.featuredImage, "thumbnail")}
                    alt=""
                    width={56}
                    height={40}
                    className="h-10 w-14 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-14 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-[240px]">
                <div className="font-medium">{blog.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  /blog/{blog.slug}
                </div>
              </TableCell>
              <TableCell>{blog.category?.name ?? "—"}</TableCell>
              <TableCell>
                <BlogStatusBadge status={blog.status} />
              </TableCell>
              <TableCell>{blog.views.toLocaleString()}</TableCell>
              <TableCell>{formatDate(blog.createdAt)}</TableCell>
              <TableCell>{formatDate(blog.updatedAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/content/blogs/${blog.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/blog/${blog.slug}?preview=1`}
                        target="_blank"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => void handleDuplicate(blog.id)}
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => void handleDelete(blog.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
