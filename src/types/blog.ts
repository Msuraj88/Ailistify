import type { BlogRobots, BlogStatus } from "@/generated/prisma/client";

export type BlogFaqItem = {
  question: string;
  answer: string;
};

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  status: BlogStatus;
  publishedAt: Date | null;
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
  createdAt: Date;
  updatedAt: Date;
  category: {
    name: string;
    slug: string;
  } | null;
  author: {
    name: string | null;
    image: string | null;
  } | null;
};

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  views: number;
  category: {
    name: string;
    slug: string;
  } | null;
};

export type GeneratedBlogContent = {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  content: string;
  faq: BlogFaqItem[];
  conclusion: string;
  cta: string;
  categoryName: string;
  linkedToolSlugs: string[];
};
