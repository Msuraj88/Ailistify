import type { PricingModel } from "@/generated/prisma/client";

export type DirectoryToolCard = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  shortDescription: string;
  pricingModel: PricingModel;
  featured: boolean;
  verified: boolean;
  sponsored: boolean;
  views: number;
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
};

export type DirectoryToolListResult = {
  tools: DirectoryToolCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DirectoryCategoryCard = {
  id: string;
  name: string;
  slug: string;
  description: string;
  toolCount: number;
};

export type DirectoryTagCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  toolCount: number;
};

export type DirectoryToolDetail = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  websiteUrl: string;
  pricingUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  discordUrl: string | null;
  shortDescription: string;
  fullDescription: string;
  pricingModel: PricingModel;
  featured: boolean;
  verified: boolean;
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { id: string; name: string; slug: string };
  tags: { id: string; name: string; slug: string }[];
  images: {
    id: string;
    imageUrl: string;
    altText: string | null;
    caption: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
};

export type HomePageData = {
  totalTools: number;
  featuredTools: DirectoryToolCard[];
  latestTools: DirectoryToolCard[];
  popularCategories: DirectoryCategoryCard[];
  popularTags: DirectoryTagCard[];
  popularSearches: { name: string; slug: string }[];
};
