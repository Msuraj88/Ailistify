import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BlogEditorForm } from "@/components/admin/blog/blog-editor-form";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";
import {
  getAdminBlogById,
  getAdminBlogCategoriesForSelect,
} from "@/services/admin/blog";

type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditBlogPageProps) {
  const { id } = await params;
  const blog = await getAdminBlogById(id);

  return createMetadata({
    title: blog ? `Edit: ${blog.title}` : "Edit Blog",
    description: "Edit blog post in AI Content Studio.",
  });
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const [blog, categories] = await Promise.all([
    getAdminBlogById(id),
    getAdminBlogCategoriesForSelect(),
  ]);

  if (!blog) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/content/blogs">
            <ChevronLeft className="h-4 w-4" />
            Back to blogs
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Edit blog
          </h1>
          <p className="mt-1 text-muted-foreground">{blog.title}</p>
        </div>
      </div>

      <BlogEditorForm blog={blog} categories={categories} />
    </div>
  );
}
