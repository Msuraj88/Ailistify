import type { PricingModel } from "@/generated/prisma/client";

export type ToolAnalyzerProgressStep =
  | "analyzing"
  | "reading"
  | "generating"
  | "finding_logo"
  | "done";

export const TOOL_ANALYZER_PROGRESS_LABELS: Record<
  ToolAnalyzerProgressStep,
  string
> = {
  analyzing: "Analyzing...",
  reading: "Reading homepage...",
  generating: "Generating content...",
  finding_logo: "Finding logo...",
  done: "Done.",
};

/** Raw JSON shape returned by Gemini. */
export type GeminiToolAnalysisResult = {
  name: string;
  websiteUrl: string;
  pricingModel: string;
  category: string;
  tags: string[];
  shortDescription: string;
  fullDescription: string;
  metaTitle: string;
  metaDescription: string;
  logoUrl: string;
  verified: boolean;
  featured: boolean;
};

/** Mapped fields ready to populate the admin tool form. */
export type ToolAnalyzerFormFill = {
  name: string;
  websiteUrl: string;
  slug: string;
  pricingModel: PricingModel;
  categoryId: string;
  tagIds: string[];
  shortDescription: string;
  fullDescription: string;
  metaTitle: string;
  metaDescription: string;
  logo: string;
  verified: boolean;
  featured: boolean;
};
