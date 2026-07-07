import { Suspense } from "react";
import { BlogsManager } from "@/components/admin/blog/blogs-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { createMetadata } from "@/lib/metadata";
import {
  getAdminBlogCategoriesForSelect,
  getAdminBlogs,
} from "@/services/admin/blog";
import { blogListFiltersSchema } from "@/validations/admin-blog";

export const metadata = createMetadata({
  title: "Blogs",
  description: "Manage SEO blog posts in AI Content Studio.",
});

type AdminBlogsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function PageSkeleton() {
  return <Skeleton className="h-96 w-full rounded-lg" />;
}

export default async function AdminBlogsPage({
  searchParams,
}: AdminBlogsPageProps) {
  const rawParams = await searchParams;
  const normalizedParams = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const filters = blogListFiltersSchema.parse(normalizedParams);

  const [result, categories] = await Promise.all([
    getAdminBlogs(filters),
    getAdminBlogCategoriesForSelect(),
  ]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <BlogsManager
        blogs={result.posts}
        categories={categories}
        currentStatus={filters.status}
        currentCategoryId={filters.categoryId}
      />
    </Suspense>
  );
}
