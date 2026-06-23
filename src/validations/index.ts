import { z } from "zod";

export const submitToolSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  websiteUrl: z.url("Please enter a valid URL"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be less than 500 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  submitterEmail: z.email("Please enter a valid email"),
});

export type SubmitToolInput = z.input<typeof submitToolSchema>;
export type SubmitToolData = z.output<typeof submitToolSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review must be less than 2000 characters"),
  toolId: z.string().min(1),
});

export type ReviewInput = z.input<typeof reviewSchema>;

export const newsletterSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export type NewsletterInput = z.input<typeof newsletterSchema>;
