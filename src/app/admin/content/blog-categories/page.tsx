import { BlogCategoriesManager } from "@/components/admin/blog-categories/blog-categories-manager";
import { createMetadata } from "@/lib/metadata";
import { getAdminBlogCategories } from "@/services/admin/blog";

export const metadata = createMetadata({
  title: "Blog Categories",
  description: "Manage blog categories in AI Content Studio.",
});

export default async function BlogCategoriesPage() {
  const categories = await getAdminBlogCategories();

  return <BlogCategoriesManager categories={categories} />;
}
