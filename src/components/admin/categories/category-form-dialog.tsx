"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
  createAdminCategory,
  updateAdminCategory,
} from "@/actions/admin/categories";
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
import type { AdminCategoryDetail } from "@/types/admin-categories";
import {
  categoryFormSchema,
  type CategoryFormInput,
} from "@/validations/admin-categories";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminCategoryDetail | null;
  onSuccess?: () => void;
};

const defaultValues: CategoryFormInput = {
  name: "",
  slug: "",
  description: "",
};

function mapCategoryToForm(category: AdminCategoryDetail): CategoryFormInput {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const isEdit = Boolean(category);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (open) {
      reset(category ? mapCategoryToForm(category) : defaultValues);
      setSlugTouched(isEdit);
      setServerError(null);
      setSuccessMessage(null);
    }
  }, [open, category, isEdit, reset]);

  useEffect(() => {
    if (!slugTouched && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, slugTouched, setValue]);

  async function onSubmit(data: CategoryFormInput) {
    setServerError(null);
    setSuccessMessage(null);

    const result = isEdit
      ? await updateAdminCategory(category!.id, data)
      : await createAdminCategory(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccessMessage(
      isEdit
        ? "Category updated successfully."
        : "Category created successfully.",
    );
    onSuccess?.();

    if (!isEdit) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit category" : "Create category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update category details used to organize tools."
              : "Add a new category for grouping AI tools."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-md border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary"
            >
              {successMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              disabled={isSubmitting}
              {...register("slug", {
                onChange: () => setSlugTouched(true),
              })}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              rows={4}
              disabled={isSubmitting}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {isEdit ? "Saving..." : "Creating..."}
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
