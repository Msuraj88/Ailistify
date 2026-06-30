import { PricingModel } from "../../../src/generated/prisma/client";

export type ToolSeed = {
  name: string;
  slug: string;
  websiteUrl: string;
  shortDescription: string;
  fullDescription: string;
  pricingModel: PricingModel;
  categorySlug: string;
  tagSlugs: string[];
  featured: boolean;
  verified: boolean;
};

/** No dummy tools — real tools are added via the admin panel. */
export const tools: ToolSeed[] = [];
