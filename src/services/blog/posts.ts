import { BlogStatus, ToolStatus, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { BlogListItem, PublicBlogPost } from "@/types/blog";

const publishedWhere: Prisma.BlogPostWhereInput = {
  OR: [
    {
      status: BlogStatus.PUBLISHED,
      OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
    },
    {
      status: BlogStatus.SCHEDULED,
      scheduledAt: { lte: new Date() },
    },
  ],
};

export async function getPublishedBlogPosts(options?: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  excludeSlug?: string;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const skip = (page - 1) * pageSize;

  const where = {
    ...publishedWhere,
    ...(options?.categorySlug
      ? { category: { slug: options.categorySlug } }
      : {}),
    ...(options?.excludeSlug ? { NOT: { slug: options.excludeSlug } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        views: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts: posts as BlogListItem[],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPublishedBlogBySlug(
  slug: string,
): Promise<PublicBlogPost | null> {
  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      ...publishedWhere,
    },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true, image: true } },
    },
  });

  return post as PublicBlogPost | null;
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<PublicBlogPost | null> {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true, image: true } },
    },
  });

  return post as PublicBlogPost | null;
}

export async function incrementBlogViews(id: string) {
  await prisma.blogPost.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

export async function getRelatedBlogPosts(
  slug: string,
  categorySlug: string | null | undefined,
  limit = 3,
) {
  return prisma.blogPost.findMany({
    where: {
      ...publishedWhere,
      slug: { not: slug },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      views: true,
      category: { select: { name: true, slug: true } },
    },
  }) as Promise<BlogListItem[]>;
}

export async function getAllPublishedBlogSlugs() {
  return prisma.blogPost.findMany({
    where: publishedWhere,
    select: { slug: true, title: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getRelatedToolsForBlog(focusKeyword: string | null) {
  if (!focusKeyword?.trim()) {
    return [];
  }

  const terms = focusKeyword
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .slice(0, 5);

  return prisma.tool.findMany({
    where: {
      status: ToolStatus.PUBLISHED,
      OR: terms.flatMap((term) => [
        { name: { contains: term, mode: "insensitive" as const } },
        {
          shortDescription: {
            contains: term,
            mode: "insensitive" as const,
          },
        },
      ]),
    },
    take: 4,
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      shortDescription: true,
      pricingModel: true,
      verified: true,
      featured: true,
    },
  });
}
