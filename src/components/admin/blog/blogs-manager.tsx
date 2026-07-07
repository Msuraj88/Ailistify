"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { BlogsFilters } from "@/components/admin/blog/blogs-filters";
import { BlogsTable } from "@/components/admin/blog/blogs-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminBlogListItem } from "@/types/admin-blog";

type BlogsManagerProps = {
  blogs: AdminBlogListItem[];
  categories: { id: string; name: string; slug: string }[];
  currentStatus?: string;
  currentCategoryId?: string;
};

function SearchSkeleton() {
  return <Skeleton className="h-10 w-full" />;
}

export function BlogsManager({
  blogs,
  categories,
  currentStatus,
  currentCategoryId,
}: BlogsManagerProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Blogs
          </h1>
          <p className="mt-1 text-muted-foreground">
            AI Content Studio — create and manage SEO blog posts.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/blogs/new">
            <Plus className="h-4 w-4" />
            Create blog
          </Link>
        </Button>
      </div>

      <BlogsFilters
        categories={categories}
        currentStatus={currentStatus}
        currentCategoryId={currentCategoryId}
      />

      <Suspense fallback={<SearchSkeleton />}>
        <AdminSearchBar
          basePath="/admin/content/blogs"
          placeholder="Search blogs by title, slug, or excerpt..."
        />
      </Suspense>

      <BlogsTable blogs={blogs} />
    </div>
  );
}
