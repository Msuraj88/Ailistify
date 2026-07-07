import type { Prisma } from "@/generated/prisma/client";
import { BlogStatus } from "@/generated/prisma/client";
import { BLOG_FIELD_LIMITS, truncateBlogField } from "@/lib/constants/blog";
import { prisma } from "@/lib/prisma";
import type {
  AdminBlogCategoryListItem,
  AdminBlogDetail,
  AdminBlogListItem,
} from "@/types/admin-blog";
import type { BlogListFilters } from "@/validations/admin-blog";

function buildWhere(filters: BlogListFilters): Prisma.BlogPostWhereInput {
  const where: Prisma.BlogPostWhereInput = {};

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  return where;
}

export async function getAdminBlogs(filters: BlogListFilters) {
  const where = buildWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: filters.pageSize,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        status: true,
        views: true,
        publishedAt: true,
        scheduledAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts: posts as AdminBlogListItem[],
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function getAdminBlogById(
  id: string,
): Promise<AdminBlogDetail | null> {
  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  return post;
}

export async function getAdminBlogCategoriesForSelect() {
  return prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getAdminBlogCategories(
  search?: string,
): Promise<AdminBlogCategoryListItem[]> {
  const categories = await prisma.blogCategory.findMany({
    where: search?.trim()
      ? {
          OR: [
            { name: { contains: search.trim(), mode: "insensitive" } },
            { slug: { contains: search.trim(), mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    postCount: category._count.posts,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }));
}

export async function isBlogSlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) {
    return false;
  }

  return existing.id !== excludeId;
}

export async function resolveUniqueBlogSlug(
  baseSlug: string,
  excludeId?: string,
) {
  let slug = baseSlug;
  let counter = 2;

  while (await isBlogSlugTaken(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function findBlogCategoryIdByName(name: string) {
  const normalized = name.trim().toLowerCase();
  const categories = await prisma.blogCategory.findMany({
    select: { id: true, name: true },
  });

  const exact = categories.find(
    (category) => category.name.toLowerCase() === normalized,
  );
  if (exact) {
    return exact.id;
  }

  const partial = categories.find((category) => {
    const lower = category.name.toLowerCase();
    return lower.includes(normalized) || normalized.includes(lower);
  });

  return partial?.id ?? null;
}

export async function createBlankBlogDraft(authorId: string) {
  const slug = await resolveUniqueBlogSlug("untitled-blog-post");

  return prisma.blogPost.create({
    data: {
      title: "Untitled Blog Post",
      slug,
      content: "<p>Start writing your blog post...</p>",
      status: BlogStatus.DRAFT,
      authorId,
    },
    select: { id: true, slug: true },
  });
}

export async function createBlogDraftFromGenerated(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  faqJson: string;
  cta: string;
  categoryId: string | null;
  authorId: string;
}) {
  const slug = await resolveUniqueBlogSlug(
    truncateBlogField(data.slug, BLOG_FIELD_LIMITS.slug) ?? data.slug,
  );

  const excerpt = truncateBlogField(data.excerpt, BLOG_FIELD_LIMITS.excerpt);
  const metaTitle = truncateBlogField(
    data.metaTitle,
    BLOG_FIELD_LIMITS.metaTitle,
  );
  const metaDescription = truncateBlogField(
    data.metaDescription,
    BLOG_FIELD_LIMITS.metaDescription,
  );
  const focusKeyword = truncateBlogField(
    data.focusKeyword,
    BLOG_FIELD_LIMITS.focusKeyword,
  );

  return prisma.blogPost.create({
    data: {
      title:
        truncateBlogField(data.title, BLOG_FIELD_LIMITS.title) ?? data.title,
      slug,
      excerpt,
      content: data.content,
      metaTitle,
      metaDescription,
      focusKeyword,
      faqJson: data.faqJson,
      cta: data.cta,
      categoryId: data.categoryId,
      authorId: data.authorId,
      status: BlogStatus.DRAFT,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
    },
    select: { id: true, slug: true },
  });
}
