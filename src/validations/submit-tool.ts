import { z } from "zod";

const optionalLogo = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || z.url().safeParse(val).success,
    "Please enter a valid logo URL",
  );

export const submitToolSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  websiteUrl: z.url("Please enter a valid website URL"),
  categoryId: z.string().min(1, "Please select a category"),
  tagIds: z.array(z.string()).default([]),
  logo: optionalLogo,
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  submitterEmail: z.email("Please enter a valid contact email"),
});

export type SubmitToolInput = z.input<typeof submitToolSchema>;
export type SubmitToolData = z.output<typeof submitToolSchema>;

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
