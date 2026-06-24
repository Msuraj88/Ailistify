"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitTool } from "@/actions/submit-tool";
import { SubmitToolLogoUpload } from "@/components/submit-tool/submit-tool-logo-upload";
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
  submitToolSchema,
  type SubmitToolInput,
} from "@/validations/submit-tool";

type SubmitToolFormProps = {
  options: {
    categories: { id: string; name: string }[];
    tags: { id: string; name: string }[];
  };
  defaultEmail?: string;
};

const defaultValues: SubmitToolInput = {
  name: "",
  websiteUrl: "",
  categoryId: "",
  tagIds: [],
  logo: "",
  description: "",
  submitterEmail: "",
};

export function SubmitToolForm({ options, defaultEmail }: SubmitToolFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitToolInput>({
    resolver: zodResolver(submitToolSchema),
    defaultValues: {
      ...defaultValues,
      submitterEmail: defaultEmail ?? "",
    },
  });

  async function onSubmit(data: SubmitToolInput) {
    setServerError(null);

    const result = await submitTool(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSubmittedSlug(result.data.slug);
    router.refresh();
  }

  if (submittedSlug) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold">Submission received</h2>
        <p className="mt-2 text-muted-foreground">
          Thanks for submitting your tool. We will review it and email you once
          it has been approved or if we need more information.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/tools">Browse tools</Link>
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSubmittedSlug(null);
              setServerError(null);
              reset({
                ...defaultValues,
                submitterEmail: defaultEmail ?? "",
              });
            }}
          >
            Submit another tool
          </Button>
        </div>
      </div>
    );
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

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Tool details</h2>
          <p className="text-sm text-muted-foreground">
            Tell us about the AI tool you want to list.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Tool name</Label>
            <Input id="name" disabled={isSubmitting} {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://"
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
            <Label htmlFor="submitterEmail">Contact email</Label>
            <Input
              id="submitterEmail"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              {...register("submitterEmail")}
            />
            {errors.submitterEmail && (
              <p className="text-sm text-destructive">
                {errors.submitterEmail.message}
              </p>
            )}
          </div>

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
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={6}
            placeholder="What does this tool do? Who is it for?"
            disabled={isSubmitting}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <SubmitToolLogoUpload
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
        {errors.logo && (
          <p className="text-sm text-destructive">{errors.logo.message}</p>
        )}
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Tags</h2>
          <p className="text-sm text-muted-foreground">
            Select tags that describe this tool.
          </p>
        </div>

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
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link href="/tools">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            "Submit for review"
          )}
        </Button>
      </div>
    </form>
  );
}
