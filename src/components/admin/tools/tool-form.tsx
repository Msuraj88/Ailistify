"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { createAdminTool, updateAdminTool } from "@/actions/admin/tools";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PRICING_MODELS, TOOL_STATUSES } from "@/lib/constants/tools";
import { slugify } from "@/lib/utils";
import type {
  AdminToolDetail,
  AdminToolFormOptions,
} from "@/types/admin-tools";
import { toolFormSchema, type ToolFormInput } from "@/validations/admin-tools";

type ToolFormProps = {
  mode: "create" | "edit";
  options: AdminToolFormOptions;
  tool?: AdminToolDetail;
};

const defaultValues: ToolFormInput = {
  name: "",
  slug: "",
  websiteUrl: "",
  pricingUrl: "",
  logo: "",
  shortDescription: "",
  fullDescription: "",
  categoryId: "",
  tagIds: [],
  pricingModel: "FREE",
  featured: false,
  verified: false,
  status: "DRAFT",
  metaTitle: "",
  metaDescription: "",
};

function mapToolToFormValues(tool: AdminToolDetail): ToolFormInput {
  return {
    name: tool.name,
    slug: tool.slug,
    websiteUrl: tool.websiteUrl,
    pricingUrl: tool.pricingUrl ?? "",
    logo: tool.logo ?? "",
    shortDescription: tool.shortDescription,
    fullDescription: tool.fullDescription,
    categoryId: tool.categoryId,
    tagIds: tool.tagIds,
    pricingModel: tool.pricingModel,
    featured: tool.featured,
    verified: tool.verified,
    status: tool.status,
    metaTitle: tool.metaTitle ?? "",
    metaDescription: tool.metaDescription ?? "",
  };
}

export function ToolForm({ mode, options, tool }: ToolFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ToolFormInput>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: tool ? mapToolToFormValues(tool) : defaultValues,
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (!slugTouched && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, slugTouched, setValue]);

  async function onSubmit(data: ToolFormInput) {
    setServerError(null);
    setSuccessMessage(null);

    const result =
      mode === "create"
        ? await createAdminTool(data)
        : await updateAdminTool(tool!.id, data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    if (mode === "create") {
      setSuccessMessage("Tool created successfully. Redirecting...");
      router.push(`/admin/tools/${result.data.id}/edit`);
      router.refresh();
      return;
    }

    setSuccessMessage("Tool updated successfully.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Basic information</h2>
          <p className="text-sm text-muted-foreground">
            Core details shown on the tool listing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" disabled={isSubmitting} {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
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
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              disabled={isSubmitting}
              {...register("websiteUrl")}
            />
            {errors.websiteUrl && (
              <p className="text-sm text-destructive">
                {errors.websiteUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricingUrl">Pricing URL</Label>
            <Input
              id="pricingUrl"
              type="url"
              disabled={isSubmitting}
              {...register("pricingUrl")}
            />
            {errors.pricingUrl && (
              <p className="text-sm text-destructive">
                {errors.pricingUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              type="url"
              disabled={isSubmitting}
              {...register("logo")}
            />
            {errors.logo && (
              <p className="text-sm text-destructive">{errors.logo.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Descriptions</h2>
          <p className="text-sm text-muted-foreground">
            Short summary and full tool description.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Textarea
            id="shortDescription"
            rows={3}
            disabled={isSubmitting}
            {...register("shortDescription")}
          />
          {errors.shortDescription && (
            <p className="text-sm text-destructive">
              {errors.shortDescription.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullDescription">Full description</Label>
          <Textarea
            id="fullDescription"
            rows={8}
            disabled={isSubmitting}
            {...register("fullDescription")}
          />
          {errors.fullDescription && (
            <p className="text-sm text-destructive">
              {errors.fullDescription.message}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Classification</h2>
          <p className="text-sm text-muted-foreground">
            Category, tags, and pricing model.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Pricing model</Label>
            <Controller
              name="pricingModel"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing model" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.pricingModel && (
              <p className="text-sm text-destructive">
                {errors.pricingModel.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <Controller
            name="tagIds"
            control={control}
            render={({ field }) => (
              <div className="grid max-h-48 gap-3 overflow-y-auto rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3">
                {options.tags.map((tag) => {
                  const checked = field.value?.includes(tag.id) ?? false;

                  return (
                    <label
                      key={tag.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={isSubmitting}
                        onCheckedChange={(value) => {
                          const next = new Set(field.value ?? []);
                          if (value) {
                            next.add(tag.id);
                          } else {
                            next.delete(tag.id);
                          }
                          field.onChange(Array.from(next));
                        }}
                      />
                      <span>{tag.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Status & visibility</h2>
          <p className="text-sm text-muted-foreground">
            Publishing status and badges.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOOL_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-sm text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="flex items-end">
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={(value) => field.onChange(value === true)}
                  />
                  <span>Featured tool</span>
                </label>
              )}
            />
          </div>

          <div className="flex items-end">
            <Controller
              name="verified"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={(value) => field.onChange(value === true)}
                  />
                  <span>Verified tool</span>
                </label>
              )}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">SEO</h2>
          <p className="text-sm text-muted-foreground">
            Optional metadata for search engines.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input
              id="metaTitle"
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
            <Label htmlFor="metaDescription">Meta description</Label>
            <Textarea
              id="metaDescription"
              rows={3}
              disabled={isSubmitting}
              {...register("metaDescription")}
            />
            {errors.metaDescription && (
              <p className="text-sm text-destructive">
                {errors.metaDescription.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link href="/admin/tools">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : mode === "create" ? (
            "Create tool"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
