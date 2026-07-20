import { z } from "zod";

export const promoteCheckoutSchema = z.object({
  plan: z.enum(["HOMEPAGE_SPONSOR", "FEATURED_LISTING"]),
  contactEmail: z
    .string()
    .trim()
    .email("Enter a valid contact email.")
    .max(255),
  toolUrl: z
    .string()
    .trim()
    .url("Enter a valid tool URL.")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "Tool URL must begin with http:// or https://",
    )
    .max(500),
});

export type PromoteCheckoutInput = z.infer<typeof promoteCheckoutSchema>;
