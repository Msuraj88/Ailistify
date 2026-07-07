"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createBlogCategory,
  updateBlogCategory,
} from "@/actions/admin/blog-categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { AdminBlogCategoryListItem } from "@/types/admin-blog";
import {
  blogCategoryFormSchema,
  type BlogCategoryFormInput,
} from "@/validations/admin-blog";

type BlogCategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminBlogCategoryListItem | null;
  onSuccess: () => void;
};

export function BlogCategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: BlogCategoryFormDialogProps) {
  const isEdit = Boolean(category);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogCategoryFormInput>({
    resolver: zodResolver(blogCategoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        description: category?.description ?? "",
      });
    }
  }, [category, open, reset]);

  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [isEdit, nameValue, setValue]);

  async function onSubmit(data: BlogCategoryFormInput) {
    const result = isEdit
      ? await updateBlogCategory(category!.id, data)
      : await createBlogCategory(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Category updated." : "Category created.");
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            Organize blog posts into categories.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} disabled={isSubmitting} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} disabled={isSubmitting} />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              {...register("description")}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
