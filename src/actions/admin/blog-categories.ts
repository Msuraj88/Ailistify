"use server";

import { revalidatePath } from "next/cache";
import { hasRole } from "@/lib/auth/roles";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogCategoryFormSchema } from "@/validations/admin-blog";
import type { ActionResult } from "@/types";

const CONTENT_PATHS = [
  "/admin/content/blogs",
  "/admin/content/blog-categories",
  "/blog",
];

function revalidateBlogPaths() {
  for (const path of CONTENT_PATHS) {
    revalidatePath(path);
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

export async function createBlogCategory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = blogCategoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return {
        success: false,
        error: "A category with this slug already exists.",
      };
    }

    const category = await prisma.blogCategory.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description?.trim() || null,
      },
    });

    revalidateBlogPaths();
    return { success: true, data: { id: category.id } };
  } catch {
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateBlogCategory(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = blogCategoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const conflict = await prisma.blogCategory.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });

    if (conflict) {
      return {
        success: false,
        error: "A category with this slug already exists.",
      };
    }

    await prisma.blogCategory.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description?.trim() || null,
      },
    });

    revalidateBlogPaths();
    return { success: true, data: { id } };
  } catch {
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteBlogCategory(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const count = await prisma.blogPost.count({ where: { categoryId: id } });
    if (count > 0) {
      return {
        success: false,
        error: "Cannot delete a category that has blog posts assigned.",
      };
    }

    await prisma.blogCategory.delete({ where: { id } });
    revalidateBlogPaths();
    return { success: true, data: { id } };
  } catch {
    return { success: false, error: "Failed to delete category." };
  }
}
