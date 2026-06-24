import { z } from "zod";

const slugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(120, "Slug must be less than 120 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens only",
  );

const optionalText = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label} must be less than ${max} characters`)
    .optional()
    .or(z.literal(""));

export const tagFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be less than 80 characters"),
  slug: slugSchema,
  description: optionalText(2000, "Description"),
  metaTitle: optionalText(70, "Meta title"),
  metaDescription: optionalText(160, "Meta description"),
});

export type TagFormInput = z.input<typeof tagFormSchema>;
export type TagFormData = z.output<typeof tagFormSchema>;

export const tagListFiltersSchema = z.object({
  q: z.string().optional(),
});

export type TagListFilters = z.infer<typeof tagListFiltersSchema>;

export const deleteTagSchema = z.object({
  id: z.string().min(1),
  confirmInUse: z.boolean().default(false),
});

export type DeleteTagInput = z.input<typeof deleteTagSchema>;
