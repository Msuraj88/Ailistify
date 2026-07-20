import type { DirectoryToolCard } from "@/types/directory";

export type BestFaqItem = {
  question: string;
  answer: string;
};

export type BestBuyingGuide = {
  howToChoose: string;
  featuresThatMatter: string[];
  whoShouldUse: string;
  pricingAdvice: string;
};

export type BestPageIcon =
  | "graduation-cap"
  | "presentation"
  | "code-2"
  | "palette"
  | "youtube"
  | "trending-up"
  | "terminal"
  | "file-text";

export type BestPageDefinition = {
  /** URL segment after /best/ */
  slug: string;
  title: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  icon: BestPageIcon;
  /** Long-form SEO intro (paragraphs separated by blank lines) */
  seoContent: string;
  buyingGuide: BestBuyingGuide;
  faq: BestFaqItem[];
  /** Ordered tool slugs resolved from the AIListify directory at build time */
  toolSlugs: string[];
  /** Other best-page slugs for related linking */
  relatedPages: string[];
};

export type BestResolvedTool = DirectoryToolCard & {
  websiteUrl: string;
  averageRating: number | null;
  reviewCount: number;
  hasFreePlan: boolean;
};

export type BestPageCardSummary = {
  slug: string;
  title: string;
  description: string;
  heroDescription: string;
  icon: BestPageIcon;
  toolCount: number;
  href: string;
};

export type BestFooterLink = {
  href: string;
  label: string;
};
