import { z } from "zod";
import { PRICING_MODELS } from "@/lib/constants/tools";

export const toolDirectoryFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  pricing: z.enum(PRICING_MODELS).optional(),
  featured: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : undefined)),
  verified: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : undefined)),
  sort: z.enum(["latest", "views", "clicks", "name"]).default("latest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(6).max(48).default(15),
});

export type ToolDirectoryFilters = z.infer<typeof toolDirectoryFiltersSchema>;

export const directorySearchSchema = z.object({
  q: z.string().optional(),
});

export type DirectorySearchFilters = z.infer<typeof directorySearchSchema>;
