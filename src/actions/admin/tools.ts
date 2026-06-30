"use server";

import { revalidatePath } from "next/cache";
import { ToolStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth/roles";
import { isImageKitConfigured } from "@/lib/imagekit/config";
import { isImageKitUrl } from "@/lib/imagekit/server";
import {
  resolveFeaturedListingInput,
  resolveSponsoredListingInput,
} from "@/lib/monetization/listings";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import {
  toolFormSchema,
  type ToolFormData,
  type ToolFormInput,
} from "@/validations/admin-tools";

const ADMIN_PATHS = ["/admin/tools", "/tools"];

function revalidateToolPaths() {
  for (const path of ADMIN_PATHS) {
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

function normalizeOptionalUrl(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeOptionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function validateTags(tagIds: string[]) {
  if (tagIds.length === 0) {
    return true;
  }

  const count = await prisma.tag.count({
    where: { id: { in: tagIds } },
  });

  return count === tagIds.length;
}

async function isSlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.tool.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) {
    return false;
  }

  return existing.id !== excludeId;
}

function validateImageKitMedia(data: ToolFormData): string | null {
  if (!isImageKitConfigured()) {
    return null;
  }

  const logo = data.logo?.trim();
  if (logo && !isImageKitUrl(logo)) {
    return "Logo must be uploaded via ImageKit.";
  }

  for (const image of data.images) {
    if (!isImageKitUrl(image.imageUrl)) {
      return "All screenshots must be uploaded via ImageKit.";
    }
  }

  return null;
}

function buildMonetizationFields(data: ToolFormData) {
  const featured = resolveFeaturedListingInput({
    featured: data.featured,
    featuredUntil: data.featuredUntil,
  });
  const sponsored = resolveSponsoredListingInput({
    sponsored: data.sponsored,
    sponsoredUntil: data.sponsoredUntil,
  });

  return {
    featured: featured.featured,
    featuredUntil: featured.featuredUntil,
    sponsored: sponsored.sponsored,
    sponsoredUntil: sponsored.sponsoredUntil,
  };
}

function buildToolImageRecords(toolId: string, data: ToolFormData) {
  return data.images.map((image, index) => ({
    toolId,
    imageUrl: image.imageUrl,
    altText: normalizeOptionalText(image.altText),
    caption: normalizeOptionalText(image.caption),
    sortOrder: image.sortOrder ?? index,
    isPrimary: index === 0,
  }));
}

async function syncToolImages(
  tx: Omit<
    typeof prisma,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
  >,
  toolId: string,
  data: ToolFormData,
) {
  await tx.toolImage.deleteMany({ where: { toolId } });

  if (data.images.length === 0) {
    return;
  }

  await tx.toolImage.createMany({
    data: buildToolImageRecords(toolId, data),
  });
}

export async function createAdminTool(
  input: ToolFormInput,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = toolFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;

  const mediaError = validateImageKitMedia(data);
  if (mediaError) {
    return { success: false, error: mediaError };
  }

  try {
    const [categoryExists, slugTaken, tagsValid] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId } }),
      isSlugTaken(data.slug),
      validateTags(data.tagIds),
    ]);

    if (!categoryExists) {
      return { success: false, error: "Selected category does not exist." };
    }

    if (slugTaken) {
      return { success: false, error: "A tool with this slug already exists." };
    }

    if (!tagsValid) {
      return {
        success: false,
        error: "One or more selected tags are invalid.",
      };
    }

    const tool = await prisma.$transaction(async (tx) => {
      const monetization = buildMonetizationFields(data);

      const created = await tx.tool.create({
        data: {
          name: data.name,
          slug: data.slug,
          websiteUrl: data.websiteUrl,
          pricingUrl: normalizeOptionalUrl(data.pricingUrl),
          logo: normalizeOptionalUrl(data.logo),
          shortDescription: data.shortDescription,
          fullDescription: data.fullDescription,
          categoryId: data.categoryId,
          pricingModel: data.pricingModel,
          featured: monetization.featured,
          featuredUntil: monetization.featuredUntil,
          sponsored: monetization.sponsored,
          sponsoredUntil: monetization.sponsoredUntil,
          verified: data.verified,
          status: ToolStatus.PUBLISHED,
          metaTitle: normalizeOptionalText(data.metaTitle),
          metaDescription: normalizeOptionalText(data.metaDescription),
          submittedById: authResult.data.userId,
        },
      });

      if (data.tagIds.length > 0) {
        await tx.toolTag.createMany({
          data: data.tagIds.map((tagId) => ({
            toolId: created.id,
            tagId,
          })),
        });
      }

      await syncToolImages(tx, created.id, data);

      return created;
    });

    revalidateToolPaths();

    return { success: true, data: { id: tool.id } };
  } catch {
    return {
      success: false,
      error: "Failed to create tool. Please try again later.",
    };
  }
}

export async function updateAdminTool(
  id: string,
  input: ToolFormInput,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = toolFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;

  const mediaError = validateImageKitMedia(data);
  if (mediaError) {
    return { success: false, error: mediaError };
  }

  try {
    const existing = await prisma.tool.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: "Tool not found." };
    }

    const [categoryExists, slugTaken, tagsValid] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId } }),
      isSlugTaken(data.slug, id),
      validateTags(data.tagIds),
    ]);

    if (!categoryExists) {
      return { success: false, error: "Selected category does not exist." };
    }

    if (slugTaken) {
      return { success: false, error: "A tool with this slug already exists." };
    }

    if (!tagsValid) {
      return {
        success: false,
        error: "One or more selected tags are invalid.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const monetization = buildMonetizationFields(data);

      await tx.tool.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          websiteUrl: data.websiteUrl,
          pricingUrl: normalizeOptionalUrl(data.pricingUrl),
          logo: normalizeOptionalUrl(data.logo),
          shortDescription: data.shortDescription,
          fullDescription: data.fullDescription,
          categoryId: data.categoryId,
          pricingModel: data.pricingModel,
          featured: monetization.featured,
          featuredUntil: monetization.featuredUntil,
          sponsored: monetization.sponsored,
          sponsoredUntil: monetization.sponsoredUntil,
          verified: data.verified,
          status: data.status,
          metaTitle: normalizeOptionalText(data.metaTitle),
          metaDescription: normalizeOptionalText(data.metaDescription),
        },
      });

      await tx.toolTag.deleteMany({ where: { toolId: id } });

      if (data.tagIds.length > 0) {
        await tx.toolTag.createMany({
          data: data.tagIds.map((tagId) => ({
            toolId: id,
            tagId,
          })),
        });
      }

      await syncToolImages(tx, id, data);
    });

    revalidateToolPaths();
    revalidatePath(`/admin/tools/${id}/edit`);

    return { success: true, data: { id } };
  } catch {
    return {
      success: false,
      error: "Failed to update tool. Please try again later.",
    };
  }
}

export async function deleteAdminTool(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const existing = await prisma.tool.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return { success: false, error: "Tool not found." };
    }

    await prisma.tool.update({
      where: { id },
      data: {
        status: ToolStatus.ARCHIVED,
        featured: false,
      },
    });

    revalidateToolPaths();

    return { success: true, data: { id } };
  } catch {
    return {
      success: false,
      error: "Failed to delete tool. Please try again later.",
    };
  }
}

export async function toggleAdminToolFeatured(
  id: string,
): Promise<ActionResult<{ featured: boolean }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const tool = await prisma.tool.findUnique({
      where: { id },
      select: { id: true, featured: true, status: true },
    });

    if (!tool) {
      return { success: false, error: "Tool not found." };
    }

    if (tool.status === ToolStatus.ARCHIVED) {
      return { success: false, error: "Archived tools cannot be featured." };
    }

    const updated = await prisma.tool.update({
      where: { id },
      data: { featured: !tool.featured },
      select: { featured: true },
    });

    revalidateToolPaths();

    return { success: true, data: { featured: updated.featured } };
  } catch {
    return {
      success: false,
      error: "Failed to update featured status. Please try again later.",
    };
  }
}

export async function toggleAdminToolVerified(
  id: string,
): Promise<ActionResult<{ verified: boolean }>> {
  const authResult = await requireAdminAction();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const tool = await prisma.tool.findUnique({
      where: { id },
      select: { id: true, verified: true },
    });

    if (!tool) {
      return { success: false, error: "Tool not found." };
    }

    const updated = await prisma.tool.update({
      where: { id },
      data: { verified: !tool.verified },
      select: { verified: true },
    });

    revalidateToolPaths();

    return { success: true, data: { verified: updated.verified } };
  } catch {
    return {
      success: false,
      error: "Failed to update verified status. Please try again later.",
    };
  }
}
