import type { ToolAnalyzerFormFill } from "@/types/tool-analyzer";
import type { ToolFormInput } from "@/validations/admin-tools";

export function mapAnalyzerFormFillToToolFormInput(
  fill: ToolAnalyzerFormFill,
): ToolFormInput {
  return {
    name: fill.name,
    slug: fill.slug,
    websiteUrl: fill.websiteUrl,
    pricingUrl: "",
    logo: fill.logo || "",
    images: [],
    shortDescription: fill.shortDescription,
    fullDescription: fill.fullDescription,
    categoryId: fill.categoryId,
    tagIds: fill.tagIds,
    pricingModel: fill.pricingModel,
    featured: fill.featured,
    featuredUntil: "",
    sponsored: false,
    sponsoredUntil: "",
    verified: fill.verified,
    status: "PUBLISHED",
    metaTitle: fill.metaTitle,
    metaDescription: fill.metaDescription,
  };
}
