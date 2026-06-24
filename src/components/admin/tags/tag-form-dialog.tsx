"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { createAdminTag, updateAdminTag } from "@/actions/admin/tags";
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
import type { AdminTagDetail } from "@/types/admin-tags";
import { tagFormSchema, type TagFormInput } from "@/validations/admin-tags";

type TagFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: AdminTagDetail | null;
  onSuccess?: () => void;
};

const defaultValues: TagFormInput = {
  name: "",
  slug: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
};

function mapTagToForm(tag: AdminTagDetail): TagFormInput {
  return {
    name: tag.name,
    slug: tag.slug,
    description: tag.description ?? "",
    metaTitle: tag.metaTitle ?? "",
    metaDescription: tag.metaDescription ?? "",
  };
}

export function TagFormDialog({
  open,
  onOpenChange,
  tag,
  onSuccess,
}: TagFormDialogProps) {
  const isEdit = Boolean(tag);
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
  } = useForm<TagFormInput>({
    resolver: zodResolver(tagFormSchema),
    defaultValues,
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (open) {
      reset(tag ? mapTagToForm(tag) : defaultValues);
      setSlugTouched(isEdit);
      setServerError(null);
      setSuccessMessage(null);
    }
  }, [open, tag, isEdit, reset]);

  useEffect(() => {
    if (!slugTouched && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, slugTouched, setValue]);

  async function onSubmit(data: TagFormInput) {
    setServerError(null);
    setSuccessMessage(null);

    const result = isEdit
      ? await updateAdminTag(tag!.id, data)
      : await createAdminTag(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccessMessage(
      isEdit ? "Tag updated successfully." : "Tag created successfully.",
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
          <DialogTitle>{isEdit ? "Edit tag" : "Create tag"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update tag details used for filtering and SEO."
              : "Add a new tag for tool discovery and filtering."}
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
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-slug">Slug</Label>
            <Input
              id="tag-slug"
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
            <Label htmlFor="tag-description">Description</Label>
            <Textarea
              id="tag-description"
              rows={3}
              disabled={isSubmitting}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-meta-title">Meta title</Label>
            <Input
              id="tag-meta-title"
              disabled={isSubmitting}
              {...register("metaTitle")}
            />
            {errors.metaTitle && (
              <p className="text-sm text-destructive">
                {errors.metaTitle.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-meta-description">Meta description</Label>
            <Textarea
              id="tag-meta-description"
              rows={2}
              disabled={isSubmitting}
              {...register("metaDescription")}
            />
            {errors.metaDescription && (
              <p className="text-sm text-destructive">
                {errors.metaDescription.message}
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
                "Create tag"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
