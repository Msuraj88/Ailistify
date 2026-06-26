import { z } from "zod";

export const bookmarkToolIdSchema = z.object({
  toolId: z.string().min(1, "Tool ID is required"),
});

export const bookmarkFiltersSchema = z.object({
  q: z.string().optional(),
  sort: z.enum(["recent", "name", "updated"]).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(6).max(48).default(12),
});

export type BookmarkFilters = z.infer<typeof bookmarkFiltersSchema>;
