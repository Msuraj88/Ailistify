"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { updateAdminBlog } from "@/actions/admin/blog";
import { BlogAiPromptPanel } from "@/components/admin/blog/blog-ai-prompt-panel";
import { BlogEditor } from "@/components/admin/blog/blog-editor";
import { BlogFeaturedImageUpload } from "@/components/admin/blog/blog-featured-image";
import { BlogSeoPanel } from "@/components/admin/blog/blog-seo-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_STATUSES, BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import { slugify } from "@/lib/utils";
import { toDatetimeLocalValue } from "@/lib/monetization/dates";
import type { AdminBlogDetail } from "@/types/admin-blog";
import { blogFormSchema, type BlogFormInput } from "@/validations/admin-blog";

type BlogEditorFormProps = {
  blog: AdminBlogDetail;
  categories: { id: string; name: string; slug: string }[];
};

function mapBlogToForm(blog: AdminBlogDetail): BlogFormInput {
  return {
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt ?? "",
    content: blog.content,
    featuredImage: blog.featuredImage ?? "",
    featuredImageId: blog.featuredImageId ?? "",
    categoryId: blog.categoryId ?? "",
    status: blog.status,
    publishedAt: toDatetimeLocalValue(blog.publishedAt),
    scheduledAt: toDatetimeLocalValue(blog.scheduledAt),
    metaTitle: blog.metaTitle ?? "",
    metaDescription: blog.metaDescription ?? "",
    focusKeyword: blog.focusKeyword ?? "",
    canonicalUrl: blog.canonicalUrl ?? "",
    robots: blog.robots,
    ogTitle: blog.ogTitle ?? "",
    ogDescription: blog.ogDescription ?? "",
    ogImage: blog.ogImage ?? "",
    faqJson: blog.faqJson ?? "",
    cta: blog.cta ?? "",
  };
}

export function BlogEditorForm({ blog, categories }: BlogEditorFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormInput>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: mapBlogToForm(blog),
  });

  const titleValue = watch("title");
  const statusValue = watch("status");

  useEffect(() => {
    if (titleValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, setValue]);

  async function saveBlog(
    data: BlogFormInput,
    statusOverride?: BlogFormInput["status"],
  ) {
    setServerError(null);
    const payload = statusOverride ? { ...data, status: statusOverride } : data;
    const result = await updateAdminBlog(blog.id, payload);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return false;
    }

    toast.success("Blog saved successfully.");
    router.refresh();
    return true;
  }

  const onSubmit = handleSubmit(async (data) => {
    await saveBlog(data);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                <Sparkles className="h-4 w-4" />
                Write with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create SEO Blog with AI</DialogTitle>
                <DialogDescription>
                  Describe what article you want to create. AI will generate a
                  complete blog draft and open it in the editor.
                </DialogDescription>
              </DialogHeader>
              <BlogAiPromptPanel onDone={() => setAiDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => saveBlog(data, "DRAFT"))}
          >
            Save Draft
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/blog/${blog.slug}?preview=1`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => saveBlog(data, "PUBLISHED"))}
          >
            Publish
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => saveBlog(data, "SCHEDULED"))}
          >
            Schedule
          </Button>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                disabled={isSubmitting}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" disabled={isSubmitting} {...register("slug")} />
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                rows={3}
                disabled={isSubmitting}
                {...register("excerpt")}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? "" : value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOG_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {BLOG_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {statusValue === "SCHEDULED" && (
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled at</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  disabled={isSubmitting}
                  {...register("scheduledAt")}
                />
              </div>
            )}

            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Content</Label>
                  <BlogEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">
                      {errors.content.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="featuredImage"
              control={control}
              render={({ field }) => (
                <BlogFeaturedImageUpload
                  value={field.value}
                  fileId={watch("featuredImageId")}
                  disabled={isSubmitting}
                  onChange={(value) => {
                    field.onChange(value?.url ?? "");
                    setValue("featuredImageId", value?.fileId ?? "");
                  }}
                />
              )}
            />
          </section>
        </div>

        <Controller
          name="metaTitle"
          control={control}
          render={() => (
            <BlogSeoPanel
              values={watch()}
              disabled={isSubmitting}
              onChange={(key, value) => {
                setValue(key as keyof BlogFormInput, value as never);
              }}
            />
          )}
        />
      </div>
    </form>
  );
}
