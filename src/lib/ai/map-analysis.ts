import type { PricingModel } from "@/generated/prisma/client";
import {
  ADMIN_TOOL_PRICING_MODELS,
  PRICING_MODELS,
} from "@/lib/constants/tools";
import { slugify } from "@/lib/utils";
import type {
  GeminiToolAnalysisResult,
  ToolAnalyzerFormFill,
} from "@/types/tool-analyzer";

type FormOption = { id: string; name: string };

function normalizePricingModel(value: string): PricingModel {
  const upper = value.trim().toUpperCase();

  if (PRICING_MODELS.includes(upper as PricingModel)) {
    if (
      ADMIN_TOOL_PRICING_MODELS.includes(
        upper as (typeof ADMIN_TOOL_PRICING_MODELS)[number],
      )
    ) {
      return upper as PricingModel;
    }

    if (upper === "SUBSCRIPTION") {
      return "PAID";
    }

    if (upper === "CONTACT") {
      return "FREEMIUM";
    }
  }

  return "FREEMIUM";
}

function matchCategoryId(
  categoryName: string,
  categories: FormOption[],
): string {
  const normalized = categoryName.trim().toLowerCase();

  const exact = categories.find(
    (category) => category.name.toLowerCase() === normalized,
  );
  if (exact) {
    return exact.id;
  }

  const partial = categories.find((category) => {
    const categoryNameLower = category.name.toLowerCase();
    return (
      normalized.includes(categoryNameLower) ||
      categoryNameLower.includes(normalized)
    );
  });

  return partial?.id ?? categories[0]?.id ?? "";
}

function matchTagIds(tagNames: string[], tags: FormOption[]): string[] {
  const ids = new Set<string>();

  for (const tagName of tagNames) {
    const normalized = tagName.trim().toLowerCase();
    const match = tags.find((tag) => tag.name.toLowerCase() === normalized);

    if (match) {
      ids.add(match.id);
      continue;
    }

    const partial = tags.find((tag) => {
      const tagNameLower = tag.name.toLowerCase();
      return (
        normalized.includes(tagNameLower) || tagNameLower.includes(normalized)
      );
    });

    if (partial) {
      ids.add(partial.id);
    }
  }

  return Array.from(ids).slice(0, 8);
}

export function mapGeminiAnalysisToFormFill(
  analysis: GeminiToolAnalysisResult,
  options: {
    categories: FormOption[];
    tags: FormOption[];
    fallbackWebsiteUrl: string;
    uploadedLogoUrl?: string | null;
  },
): ToolAnalyzerFormFill {
  const name = analysis.name.trim().slice(0, 100);
  const websiteUrl = analysis.websiteUrl.trim() || options.fallbackWebsiteUrl;

  return {
    name,
    websiteUrl,
    slug: slugify(name),
    pricingModel: normalizePricingModel(analysis.pricingModel),
    categoryId: matchCategoryId(analysis.category, options.categories),
    tagIds: matchTagIds(analysis.tags, options.tags),
    shortDescription: analysis.shortDescription.trim().slice(0, 300),
    fullDescription: analysis.fullDescription.trim().slice(0, 10_000),
    metaTitle: analysis.metaTitle.trim().slice(0, 70),
    metaDescription: analysis.metaDescription.trim().slice(0, 160),
    logo: options.uploadedLogoUrl ?? analysis.logoUrl.trim(),
    verified: analysis.verified,
    featured: analysis.featured,
  };
}
