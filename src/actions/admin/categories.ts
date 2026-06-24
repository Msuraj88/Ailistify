"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import {
  categoryFormSchema,
  type CategoryFormInput,
} from "@/validations/admin-categories";

const ADMIN_PATH = "/admin/categories";

async function isCategorySlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) {
    return false;
  }

  return existing.id !== excludeId;
}

export async function createAdminCategory(
  input: CategoryFormInput,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;

  try {
    if (await isCategorySlugTaken(data.slug)) {
      return {
        success: false,
        error: "A category with this slug already exists.",
      };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
    });

    revalidatePath(ADMIN_PATH);
    revalidatePath("/admin/tools");

    return { success: true, data: { id: category.id } };
  } catch {
    return {
      success: false,
      error: "Failed to create category. Please try again later.",
    };
  }
}

export async function updateAdminCategory(
  id: string,
  input: CategoryFormInput,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: "Category not found." };
    }

    if (await isCategorySlugTaken(data.slug, id)) {
      return {
        success: false,
        error: "A category with this slug already exists.",
      };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
    });

    revalidatePath(ADMIN_PATH);
    revalidatePath("/admin/tools");

    return { success: true, data: { id } };
  } catch {
    return {
      success: false,
      error: "Failed to update category. Please try again later.",
    };
  }
}

export async function deleteAdminCategory(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: { select: { tools: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Category not found." };
    }

    if (existing._count.tools > 0) {
      return {
        success: false,
        error: `Cannot delete "${existing.name}" because ${existing._count.tools} tool(s) are assigned to it. Reassign or remove those tools first.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath(ADMIN_PATH);
    revalidatePath("/admin/tools");

    return { success: true, data: { id } };
  } catch {
    return {
      success: false,
      error: "Failed to delete category. Please try again later.",
    };
  }
}
