import { z } from "zod";

const optionalDateTime = z.string().optional().or(z.literal(""));

export const featuredListingSchema = z.object({
  featured: z.boolean(),
  featuredUntil: optionalDateTime,
});

export const sponsoredListingSchema = z.object({
  sponsored: z.boolean(),
  sponsoredUntil: optionalDateTime,
});

export const monetizationListingSchema = z.object({
  featured: z.boolean(),
  featuredUntil: optionalDateTime,
  sponsored: z.boolean(),
  sponsoredUntil: optionalDateTime,
});

export type MonetizationListingInput = z.infer<
  typeof monetizationListingSchema
>;
