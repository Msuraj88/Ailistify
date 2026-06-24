import { z } from "zod";

const slugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(120, "Slug must be less than 120 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens only",
  );

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be less than 80 characters"),
  slug: slugSchema,
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormData = z.output<typeof categoryFormSchema>;

export const categoryListFiltersSchema = z.object({
  q: z.string().optional(),
});

export type CategoryListFilters = z.infer<typeof categoryListFiltersSchema>;
