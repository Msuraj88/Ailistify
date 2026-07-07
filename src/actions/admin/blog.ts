"use server";

import { revalidatePath } from "next/cache";
import { BlogStatus } from "@/generated/prisma/client";
import { BLOG_FIELD_LIMITS, truncateBlogField } from "@/lib/constants/blog";
import { hasRole } from "@/lib/auth/roles";
import { auth } from "@/lib/auth";
import { isImageKitConfigured } from "@/lib/imagekit/config";
import { isImageKitUrl } from "@/lib/imagekit/server";
import { generateBlogWithGemini } from "@/lib/gemini/blog-generator";
import { slugify } from "@/lib/utils";
import { normalizeBlogHtml } from "@/lib/blog/content";
import { prisma } from "@/lib/prisma";
import {
  createBlogDraftFromGenerated,
  findBlogCategoryIdByName,
  getAdminBlogCategories,
  isBlogSlugTaken,
  resolveUniqueBlogSlug,
} from "@/services/admin/blog";
import type { ActionResult } from "@/types";
import {
  blogFormSchema,
  createBlogSchema,
  generateBlogSchema,
  type BlogFormInput,
} from "@/validations/admin-blog";

const CONTENT_PATHS = ["/admin/content/blogs", "/blog", "/blog/rss.xml"];

function revalidateBlogPaths(slug?: string) {
  for (const path of CONTENT_PATHS) {
    revalidatePath(path);
  }

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

async function requireAdminAction(): Promise<ActionResult<{ userId: string }>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  if (!hasRole(session.user.role, "ADMIN")) {
    return { success: false, error: "You do not have permission to do that." };
  }

  return { success: true, data: { userId: session.user.id } };
}

export async function generateBlogWithAI(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = generateBlogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid prompt",
    };
  }

  try {
    const categories = await getAdminBlogCategories();
    const categoryNames = categories.map((category) => category.name);
    const generated = await generateBlogWithGemini(
      parsed.data.prompt,
      categoryNames,
    );

    const categoryId = await findBlogCategoryIdByName(generated.categoryName);
    const normalizedSlug = slugify(generated.slug || generated.title);

    const draft = await createBlogDraftFromGenerated({
      title: generated.title.trim(),
      slug: normalizedSlug,
      excerpt: generated.excerpt.trim(),
      content: normalizeBlogHtml(generated.content.trim()),
      metaTitle: generated.metaTitle.trim(),
      metaDescription: generated.metaDescription.trim(),
      focusKeyword: generated.focusKeyword.trim(),
      faqJson: JSON.stringify(generated.faq),
      cta: generated.cta.trim(),
      categoryId,
      authorId: authResult.data.userId,
    });

    revalidateBlogPaths();

    return {
      success: true,
      data: { id: draft.id, slug: draft.slug },
    };
  } catch (error) {
    console.error("[blog-ai] generation failed", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Blog generation failed. Please try again.",
    };
  }
}

export async function createAdminBlog(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = createBlogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;

  try {
    if (data.categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return { success: false, error: "Selected category does not exist." };
      }
    }

    const baseSlug = slugify(data.title) || "untitled-post";
    const slug = await resolveUniqueBlogSlug(
      truncateBlogField(baseSlug, BLOG_FIELD_LIMITS.slug) ?? baseSlug,
    );

    const created = await prisma.blogPost.create({
      data: {
        title:
          truncateBlogField(data.title, BLOG_FIELD_LIMITS.title) ?? data.title,
        slug,
        content: normalizeBlogHtml(data.content),
        excerpt: truncateBlogField(data.excerpt, BLOG_FIELD_LIMITS.excerpt),
        categoryId: data.categoryId || null,
        status: BlogStatus.DRAFT,
        authorId: authResult.data.userId,
      },
      select: { id: true, slug: true },
    });

    revalidateBlogPaths();

    return { success: true, data: created };
  } catch (error) {
    console.error("[blog] manual create failed", error);
    return { success: false, error: "Failed to create blog post." };
  }
}

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseDateInput(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateFeaturedImage(url: string | undefined) {
  if (!isImageKitConfigured()) {
    return null;
  }

  const trimmed = url?.trim();
  if (trimmed && !isImageKitUrl(trimmed)) {
    return "Featured image must be uploaded via ImageKit.";
  }

  return null;
}

function resolvePublishFields(data: BlogFormInput) {
  const publishedAt = parseDateInput(data.publishedAt);
  const scheduledAt = parseDateInput(data.scheduledAt);

  if (data.status === "PUBLISHED") {
    return {
      status: BlogStatus.PUBLISHED,
      publishedAt: publishedAt ?? new Date(),
      scheduledAt: null,
    };
  }

  if (data.status === "SCHEDULED") {
    return {
      status: BlogStatus.SCHEDULED,
      publishedAt: null,
      scheduledAt: scheduledAt ?? new Date(Date.now() + 86_400_000),
    };
  }

  if (data.status === "ARCHIVED") {
    return {
      status: BlogStatus.ARCHIVED,
      publishedAt,
      scheduledAt: null,
    };
  }

  return {
    status: BlogStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
  };
}

export async function updateAdminBlog(
  id: string,
  input: BlogFormInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = blogFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;
  const imageError = validateFeaturedImage(data.featuredImage);
  if (imageError) {
    return { success: false, error: imageError };
  }

  try {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Blog post not found." };
    }

    if (await isBlogSlugTaken(data.slug, id)) {
      return { success: false, error: "A blog with this slug already exists." };
    }

    if (data.categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return { success: false, error: "Selected category does not exist." };
      }
    }

    const publishFields = resolvePublishFields(data);

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title:
          truncateBlogField(data.title, BLOG_FIELD_LIMITS.title) ?? data.title,
        slug: truncateBlogField(data.slug, BLOG_FIELD_LIMITS.slug) ?? data.slug,
        excerpt: truncateBlogField(data.excerpt, BLOG_FIELD_LIMITS.excerpt),
        content: normalizeBlogHtml(data.content),
        featuredImage: normalizeOptional(data.featuredImage),
        featuredImageId: normalizeOptional(data.featuredImageId),
        categoryId: data.categoryId || null,
        metaTitle: truncateBlogField(
          data.metaTitle,
          BLOG_FIELD_LIMITS.metaTitle,
        ),
        metaDescription: truncateBlogField(
          data.metaDescription,
          BLOG_FIELD_LIMITS.metaDescription,
        ),
        focusKeyword: truncateBlogField(
          data.focusKeyword,
          BLOG_FIELD_LIMITS.focusKeyword,
        ),
        canonicalUrl: normalizeOptional(data.canonicalUrl),
        robots: data.robots,
        ogTitle: truncateBlogField(data.ogTitle, BLOG_FIELD_LIMITS.ogTitle),
        ogDescription: truncateBlogField(
          data.ogDescription,
          BLOG_FIELD_LIMITS.ogDescription,
        ),
        ogImage: normalizeOptional(data.ogImage),
        faqJson: normalizeOptional(data.faqJson),
        cta: normalizeOptional(data.cta),
        ...publishFields,
      },
      select: { id: true, slug: true },
    });

    revalidateBlogPaths(updated.slug);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update blog post." };
  }
}

export async function deleteAdminBlog(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    await prisma.blogPost.delete({ where: { id } });
    revalidateBlogPaths();
    return { success: true, data: { id } };
  } catch {
    return { success: false, error: "Failed to delete blog post." };
  }
}

export async function duplicateAdminBlog(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const source = await prisma.blogPost.findUnique({ where: { id } });
    if (!source) {
      return { success: false, error: "Blog post not found." };
    }

    const slug = await resolveUniqueBlogSlug(`${source.slug}-copy`);

    const duplicate = await prisma.blogPost.create({
      data: {
        title: `${source.title} (Copy)`,
        slug,
        excerpt: source.excerpt,
        content: source.content,
        featuredImage: source.featuredImage,
        featuredImageId: source.featuredImageId,
        categoryId: source.categoryId,
        metaTitle: source.metaTitle,
        metaDescription: source.metaDescription,
        focusKeyword: source.focusKeyword,
        canonicalUrl: source.canonicalUrl,
        robots: source.robots,
        ogTitle: source.ogTitle,
        ogDescription: source.ogDescription,
        ogImage: source.ogImage,
        faqJson: source.faqJson,
        cta: source.cta,
        status: BlogStatus.DRAFT,
        authorId: authResult.data.userId,
      },
      select: { id: true },
    });

    revalidateBlogPaths();
    return { success: true, data: { id: duplicate.id } };
  } catch {
    return { success: false, error: "Failed to duplicate blog post." };
  }
}
