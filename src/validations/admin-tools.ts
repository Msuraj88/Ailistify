import { z } from "zod";
import { PRICING_MODELS, TOOL_STATUSES } from "@/lib/constants/tools";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || z.url().safeParse(val).success,
    "Please enter a valid URL",
  );

export const toolImageFormSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.url("Please enter a valid image URL"),
  altText: z
    .string()
    .max(200, "Alt text must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  caption: z
    .string()
    .max(300, "Caption must be less than 300 characters")
    .optional()
    .or(z.literal("")),
  sortOrder: z.number().int().min(0),
});

export const toolFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug must be less than 120 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  websiteUrl: z.url("Please enter a valid website URL"),
  pricingUrl: optionalUrl,
  logo: optionalUrl,
  images: z.array(toolImageFormSchema).default([]),
  shortDescription: z
    .string()
    .min(20, "Short description must be at least 20 characters")
    .max(300, "Short description must be less than 300 characters"),
  fullDescription: z
    .string()
    .min(20, "Full description must be at least 20 characters")
    .max(10000, "Full description is too long"),
  categoryId: z.string().min(1, "Please select a category"),
  tagIds: z.array(z.string()).default([]),
  pricingModel: z.enum(PRICING_MODELS),
  featured: z.boolean(),
  featuredUntil: z.string().optional().or(z.literal("")),
  sponsored: z.boolean(),
  sponsoredUntil: z.string().optional().or(z.literal("")),
  verified: z.boolean(),
  status: z.enum(TOOL_STATUSES),
  metaTitle: z
    .string()
    .max(70, "Meta title must be less than 70 characters")
    .optional()
    .or(z.literal("")),
  metaDescription: z
    .string()
    .max(160, "Meta description must be less than 160 characters")
    .optional()
    .or(z.literal("")),
});

export type ToolFormInput = z.input<typeof toolFormSchema>;
export type ToolFormData = z.output<typeof toolFormSchema>;
export type ToolImageFormInput = z.infer<typeof toolImageFormSchema>;

export const toolListFiltersSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(TOOL_STATUSES).optional(),
  pricingModel: z.enum(PRICING_MODELS).optional(),
  featured: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    ),
  sort: z.enum(["newest", "views"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
});

export type ToolListFilters = z.infer<typeof toolListFiltersSchema>;
