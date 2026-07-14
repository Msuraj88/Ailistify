import { z } from "zod";

export const userListFiltersSchema = z.object({
  q: z.string().optional(),
});

export type UserListFilters = z.infer<typeof userListFiltersSchema>;
