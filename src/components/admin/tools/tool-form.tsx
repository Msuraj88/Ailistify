"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { analyzeToolFromUrl } from "@/actions/analyze-tool";
import { createAdminTool, updateAdminTool } from "@/actions/admin/tools";
import { ToolLogoUpload } from "@/components/admin/tools/tool-logo-upload";
// import { ToolScreenshotsManager } from "@/components/admin/tools/tool-screenshots-manager";
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
import {
  ADMIN_TOOL_PRICING_MODELS,
} from "@/lib/constants/tools";
import { toDatetimeLocalValue } from "@/lib/monetization/dates";
import { slugify } from "@/lib/utils";
import type {
  AdminToolDetail,
  AdminToolFormOptions,
} from "@/types/admin-tools";
import { toolFormSchema, type ToolFormInput } from "@/validations/admin-tools";
import { analyzeToolUrlSchema } from "@/validations/analyze-tool";

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
  images: [],
  shortDescription: "",
  fullDescription: "",
  categoryId: "",
  tagIds: [],
  pricingModel: "FREE",
  featured: false,
  featuredUntil: "",
  sponsored: false,
  sponsoredUntil: "",
  verified: false,
  status: "PUBLISHED",
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
    images: tool.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText ?? "",
      caption: image.caption ?? "",
      sortOrder: image.sortOrder,
    })),
    shortDescription: tool.shortDescription,
    fullDescription: tool.fullDescription,
    categoryId: tool.categoryId,
    tagIds: tool.tagIds,
    pricingModel: tool.pricingModel,
    featured: tool.featured,
    featuredUntil: toDatetimeLocalValue(tool.featuredUntil),
    sponsored: tool.sponsored,
    sponsoredUntil: toDatetimeLocalValue(tool.sponsoredUntil),
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState<string | null>(null);

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
  const formDisabled = isSubmitting || isAnalyzing;

  useEffect(() => {
    if (mode === "create" && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [mode, nameValue, setValue]);

  async function onSubmit(data: ToolFormInput) {
    setServerError(null);
    setSuccessMessage(null);

    const payload =
      mode === "create" ? { ...data, status: "PUBLISHED" as const } : data;

    const result =
      mode === "create"
        ? await createAdminTool(payload)
        : await updateAdminTool(tool!.id, payload);

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

  async function handleAnalyze() {
    const websiteUrl = watch("websiteUrl");
    const parsed = analyzeToolUrlSchema.safeParse({ url: websiteUrl });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Please enter a valid URL.",
      );
      return;
    }

    setServerError(null);
    setIsAnalyzing(true);

    const progressSteps = [
      "Analyzing...",
      "Reading homepage...",
      "Generating content...",
      "Finding logo...",
    ];
    let stepIndex = 0;
    setAnalyzeProgress(progressSteps[0]);

    const progressInterval = window.setInterval(() => {
      stepIndex = (stepIndex + 1) % progressSteps.length;
      setAnalyzeProgress(progressSteps[stepIndex]);
    }, 2000);

    try {
      const result = await analyzeToolFromUrl({ url: parsed.data.url });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const data = result.data;
      setValue("websiteUrl", data.websiteUrl);
      setValue("name", data.name);
      setValue("slug", data.slug);
      setValue("categoryId", data.categoryId);
      setValue("pricingModel", data.pricingModel);
      setValue("tagIds", data.tagIds);
      setValue("shortDescription", data.shortDescription);
      setValue("fullDescription", data.fullDescription);
      setValue("metaTitle", data.metaTitle);
      setValue("metaDescription", data.metaDescription);
      setValue("logo", data.logo);
      setValue("verified", data.verified);
      setValue("featured", data.featured);

      setAnalyzeProgress("Done.");
      toast.success("Tool details generated. Review and edit before saving.");
    } catch {
      toast.error("Tool analysis failed. Please try again.");
    } finally {
      window.clearInterval(progressInterval);
      setIsAnalyzing(false);
      window.setTimeout(() => setAnalyzeProgress(null), 1500);
    }
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
          <h2 className="text-lg font-semibold">Tool details</h2>
          <p className="text-sm text-muted-foreground">
            Core details shown on the tool listing.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Tool URL</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://example.com"
                disabled={formDisabled}
                className="flex-1"
                {...register("websiteUrl")}
              />
              <Button
                type="button"
                variant="outline"
                className="sm:shrink-0"
                disabled={formDisabled}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <span aria-hidden="true">✨</span>
                )}
                Analyze
              </Button>
            </div>
            {analyzeProgress && (
              <p className="text-sm text-muted-foreground" role="status">
                {analyzeProgress}
              </p>
            )}
            {errors.websiteUrl && (
              <p className="text-sm text-destructive">
                {errors.websiteUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tool name</Label>
            <Input id="name" disabled={formDisabled} {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <input type="hidden" {...register("slug")} />

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
                    disabled={formDisabled}
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
                    disabled={formDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing model" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_TOOL_PRICING_MODELS.map((model) => (
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
            <Label htmlFor="shortDescription">Short description</Label>
            <Textarea
              id="shortDescription"
              rows={3}
              disabled={formDisabled}
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
              disabled={formDisabled}
              {...register("fullDescription")}
            />
            {errors.fullDescription && (
              <p className="text-sm text-destructive">
                {errors.fullDescription.message}
              </p>
            )}
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
                          disabled={formDisabled}
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

          <div className="space-y-2">
            <Controller
              name="logo"
              control={control}
              render={({ field }) => (
                <ToolLogoUpload
                  value={field.value}
                  onChange={field.onChange}
                  disabled={formDisabled}
                />
              )}
            />
            {errors.logo && (
              <p className="text-sm text-destructive">{errors.logo.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Screenshots — disabled for now
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Screenshots</h2>
          <p className="text-sm text-muted-foreground">
            Upload product screenshots. Drag to reorder before saving.
          </p>
        </div>

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ToolScreenshotsManager
              value={field.value ?? []}
              onChange={field.onChange}
              disabled={formDisabled}
            />
          )}
        />
        {errors.images && (
          <p className="text-sm text-destructive">
            {typeof errors.images.message === "string"
              ? errors.images.message
              : "Please check screenshot fields."}
          </p>
        )}
      </section>
      */}

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
              disabled={formDisabled}
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
              disabled={formDisabled}
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

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Visibility</h2>
          <p className="text-sm text-muted-foreground">
            Badges shown on the public tool listing.
          </p>
        </div>

        <Controller
          name="verified"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={field.value}
                disabled={formDisabled}
                onCheckedChange={(value) => field.onChange(value === true)}
              />
              <span>Verified tool</span>
            </label>
          )}
        />
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Monetization</h2>
          <p className="text-sm text-muted-foreground">
            Featured and sponsored placements with optional expiry dates.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 rounded-md border p-4">
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={field.value}
                    disabled={formDisabled}
                    onCheckedChange={(value) => field.onChange(value === true)}
                  />
                  <span>Featured listing</span>
                </label>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="featuredUntil">Featured until</Label>
              <Input
                id="featuredUntil"
                type="datetime-local"
                disabled={formDisabled || !watch("featured")}
                {...register("featuredUntil")}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiry. Expired featured tools are
                unpublished automatically.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <Controller
              name="sponsored"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={field.value}
                    disabled={formDisabled}
                    onCheckedChange={(value) => field.onChange(value === true)}
                  />
                  <span>Sponsored listing</span>
                </label>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="sponsoredUntil">Sponsored until</Label>
              <Input
                id="sponsoredUntil"
                type="datetime-local"
                disabled={formDisabled || !watch("sponsored")}
                {...register("sponsoredUntil")}
              />
              <p className="text-xs text-muted-foreground">
                Sponsored tools are highlighted and sorted first in listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild disabled={formDisabled}>
          <Link href="/admin/tools">Cancel</Link>
        </Button>
        <Button type="submit" disabled={formDisabled}>
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
