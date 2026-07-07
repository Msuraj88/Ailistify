import { z } from "zod";
import { BLOG_ROBOTS, BLOG_STATUSES } from "@/lib/constants/blog";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || z.url().safeParse(val).success,
    "Please enter a valid URL",
  );

export const blogCategoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be less than 80 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug must be less than 120 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug must be less than 120 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  content: z.string().min(20, "Content must be at least 20 characters"),
  featuredImage: optionalUrl,
  featuredImageId: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  status: z.enum(BLOG_STATUSES),
  publishedAt: z.string().optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
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
  focusKeyword: z
    .string()
    .max(100, "Focus keyword must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  canonicalUrl: optionalUrl,
  robots: z.enum(BLOG_ROBOTS),
  ogTitle: z
    .string()
    .max(70, "OG title must be less than 70 characters")
    .optional()
    .or(z.literal("")),
  ogDescription: z
    .string()
    .max(160, "OG description must be less than 160 characters")
    .optional()
    .or(z.literal("")),
  ogImage: optionalUrl,
  faqJson: z.string().optional().or(z.literal("")),
  cta: z.string().max(2000).optional().or(z.literal("")),
});

export const blogListFiltersSchema = z.object({
  q: z.string().optional(),
  status: z.enum(BLOG_STATUSES).optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(12),
});

export const createBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  content: z.string().trim().min(20, "Content must be at least 20 characters"),
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
});

export const generateBlogSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(10, "Please describe the article you want to create")
    .max(2000, "Prompt is too long"),
});

export type BlogFormInput = z.input<typeof blogFormSchema>;
export type BlogFormData = z.output<typeof blogFormSchema>;
export type CreateBlogInput = z.input<typeof createBlogSchema>;
export type BlogCategoryFormInput = z.infer<typeof blogCategoryFormSchema>;
export type BlogListFilters = z.infer<typeof blogListFiltersSchema>;
