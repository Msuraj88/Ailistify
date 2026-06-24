import type { PricingModel, ToolStatus } from "@/generated/prisma/client";

export type AdminToolListItem = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  pricingModel: PricingModel;
  status: ToolStatus;
  featured: boolean;
  verified: boolean;
  views: number;
  createdAt: Date;
  category: { id: string; name: string };
};

export type AdminToolListResult = {
  tools: AdminToolListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminToolFormOptions = {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};

export type AdminToolImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type AdminToolDetail = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  pricingUrl: string | null;
  logo: string | null;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  tagIds: string[];
  images: AdminToolImage[];
  pricingModel: PricingModel;
  featured: boolean;
  verified: boolean;
  status: ToolStatus;
  metaTitle: string | null;
  metaDescription: string | null;
};
