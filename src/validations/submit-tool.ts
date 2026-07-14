import { z } from "zod";
import {
  ADMIN_TOOL_PRICING_MODELS,
  LISTING_PLANS,
} from "@/lib/constants/tools";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || z.url().safeParse(val).success,
    "Please enter a valid URL",
  );

const submitImageSchema = z.object({
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

export const submitToolSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  websiteUrl: z.url("Please enter a valid website URL"),
  submitterEmail: z.email("Please enter a valid contact email"),
  categoryId: z.string().min(1, "Please select a category"),
  pricingModel: z.enum(ADMIN_TOOL_PRICING_MODELS),
  tagIds: z.array(z.string()).default([]),
  shortDescription: z
    .string()
    .min(20, "Short description must be at least 20 characters")
    .max(300, "Short description must be less than 300 characters"),
  fullDescription: z
    .string()
    .min(20, "Full description must be at least 20 characters")
    .max(10000, "Full description is too long"),
  logo: optionalUrl,
  images: z.array(submitImageSchema).default([]),
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
  twitterUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  discordUrl: optionalUrl,
  pricingUrl: optionalUrl,
  listingPlan: z.enum(LISTING_PLANS),
});

export type SubmitToolInput = z.input<typeof submitToolSchema>;
export type SubmitToolData = z.output<typeof submitToolSchema>;

export const updateMyToolSchema = submitToolSchema.omit({ listingPlan: true });

export type UpdateMyToolInput = z.input<typeof updateMyToolSchema>;
export type UpdateMyToolData = z.output<typeof updateMyToolSchema>;

export const rejectToolSubmissionSchema = z.object({
  toolId: z.string().min(1),
  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export type RejectToolSubmissionInput = z.infer<
  typeof rejectToolSubmissionSchema
>;

export const capturePayPalOrderSchema = z.object({
  orderId: z.string().min(1),
  toolId: z.string().min(1),
});

export type CapturePayPalOrderInput = z.infer<typeof capturePayPalOrderSchema>;
