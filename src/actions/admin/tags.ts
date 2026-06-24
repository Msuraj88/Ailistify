"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth/require-admin-action";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import {
  deleteTagSchema,
  tagFormSchema,
  type DeleteTagInput,
  type TagFormInput,
} from "@/validations/admin-tags";

const ADMIN_PATH = "/admin/tags";

function normalizeOptionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function isTagSlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.tag.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) {
    return false;
  }

  return existing.id !== excludeId;
}

export async function createAdminTag(
  input: TagFormInput,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = tagFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;

  try {
    if (await isTagSlugTaken(data.slug)) {
      return { success: false, error: "A tag with this slug already exists." };
    }

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: normalizeOptionalText(data.description),
        metaTitle: normalizeOptionalText(data.metaTitle),
        metaDescription: normalizeOptionalText(data.metaDescription),
      },
    });

    revalidatePath(ADMIN_PATH);
    revalidatePath("/admin/tools");

    return { success: true, data: { id: tag.id } };
  } catch {
    return {
      success: false,
      error: "Failed to create tag. Please try again later.",
    };
  }
}

export async function updateAdminTag(
  id: string,
  input: TagFormInput,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = tagFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.tag.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: "Tag not found." };
    }

    if (await isTagSlugTaken(data.slug, id)) {
      return { success: false, error: "A tag with this slug already exists." };
    }

    await prisma.tag.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: normalizeOptionalText(data.description),
        metaTitle: normalizeOptionalText(data.metaTitle),
        metaDescription: normalizeOptionalText(data.metaDescription),
      },
    });

    revalidatePath(ADMIN_PATH);
    revalidatePath("/admin/tools");

    return { success: true, data: { id } };
  } catch {
    return {
      success: false,
      error: "Failed to update tag. Please try again later.",
    };
  }
}

export async function deleteAdminTag(
  input: DeleteTagInput,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = deleteTagSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { id, confirmInUse } = parsed.data;

  try {
    const existing = await prisma.tag.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: { select: { tools: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Tag not found." };
    }

    if (existing._count.tools > 0 && !confirmInUse) {
      return {
        success: false,
        error: `This tag is used by ${existing._count.tools} tool(s). Confirm deletion to remove it from all tools.`,
      };
    }

    await prisma.tag.delete({ where: { id } });

    revalidatePath(ADMIN_PATH);
    revalidatePath("/admin/tools");

    return { success: true, data: { id } };
  } catch {
    return {
      success: false,
      error: "Failed to delete tag. Please try again later.",
    };
  }
}
