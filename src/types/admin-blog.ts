import type { BlogRobots, BlogStatus } from "@/generated/prisma/client";

export type AdminBlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: BlogStatus;
  views: number;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type AdminBlogDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  featuredImageId: string | null;
  status: BlogStatus;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  robots: BlogRobots;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  faqJson: string | null;
  cta: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminBlogCategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
};
