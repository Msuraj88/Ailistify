import type { BlogRobots, BlogStatus } from "@/generated/prisma/client";

export const BLOG_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "SCHEDULED",
  "ARCHIVED",
] as const satisfies readonly BlogStatus[];

export const BLOG_ROBOTS = [
  "INDEX_FOLLOW",
  "NOINDEX_FOLLOW",
  "INDEX_NOFOLLOW",
  "NOINDEX_NOFOLLOW",
] as const satisfies readonly BlogRobots[];

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  SCHEDULED: "Scheduled",
  ARCHIVED: "Archived",
};

export const BLOG_ROBOTS_LABELS: Record<BlogRobots, string> = {
  INDEX_FOLLOW: "Index, Follow",
  NOINDEX_FOLLOW: "No Index, Follow",
  INDEX_NOFOLLOW: "Index, No Follow",
  NOINDEX_NOFOLLOW: "No Index, No Follow",
};

export const BLOG_AI_EXAMPLES = [
  "Write a complete blog on the best AI video generators.",
  "Compare Cursor vs Windsurf.",
  "Top AI Coding Assistants.",
  "Best AI Tools for Students.",
  "Create a Midjourney Prompt Guide.",
  "Write an article about AI productivity tools.",
] as const;

export const BLOG_IMAGEKIT_FOLDER = "/blog/featured";

export const BLOG_FIELD_LIMITS = {
  title: 200,
  slug: 120,
  excerpt: 500,
  metaTitle: 70,
  metaDescription: 160,
  focusKeyword: 100,
  ogTitle: 70,
  ogDescription: 160,
} as const;

export function truncateBlogField(
  value: string | null | undefined,
  max: number,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= max) {
    return trimmed;
  }

  return trimmed.slice(0, max).trimEnd();
}
