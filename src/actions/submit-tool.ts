"use server";

import { revalidatePath } from "next/cache";
import { ToolStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { sendSubmissionReceivedEmail } from "@/lib/email/tool-submission";
import { isImageKitConfigured } from "@/lib/imagekit/config";
import { isImageKitUrl } from "@/lib/imagekit/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";
import {
  submitToolSchema,
  type SubmitToolInput,
} from "@/validations/submit-tool";

const PUBLIC_PATHS = ["/tools", "/admin/tools", "/submit-tool"];

function revalidateSubmissionPaths() {
  for (const path of PUBLIC_PATHS) {
    revalidatePath(path);
  }
}

function normalizeOptionalUrl(value: string | undefined) {
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

async function resolveUniqueSlug(baseName: string) {
  const baseSlug = slugify(baseName);
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.tool.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function submitTool(
  input: SubmitToolInput,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = submitToolSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;
  const session = await auth();
  const submitterEmail = data.submitterEmail.toLowerCase();

  const normalizedLogo = normalizeOptionalUrl(data.logo);
  if (
    normalizedLogo &&
    isImageKitConfigured() &&
    !isImageKitUrl(normalizedLogo)
  ) {
    return {
      success: false,
      error: "Logo must be uploaded via the form uploader.",
    };
  }

  try {
    const [category, tagsValid, slug] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId } }),
      validateTags(data.tagIds),
      resolveUniqueSlug(data.name),
    ]);

    if (!category) {
      return { success: false, error: "Selected category does not exist." };
    }

    if (!tagsValid) {
      return {
        success: false,
        error: "One or more selected tags are invalid.",
      };
    }

    const description = data.description.trim();
    const shortDescription =
      description.length > 300
        ? `${description.slice(0, 297)}...`
        : description;

    const tool = await prisma.$transaction(async (tx) => {
      const created = await tx.tool.create({
        data: {
          name: data.name.trim(),
          slug,
          shortDescription,
          fullDescription: description,
          websiteUrl: data.websiteUrl.trim(),
          logo: normalizedLogo,
          categoryId: data.categoryId,
          submittedById: session?.user?.id ?? null,
          submitterEmail,
          status: ToolStatus.PENDING,
          featured: false,
          verified: false,
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

      return created;
    });

    await sendSubmissionReceivedEmail({
      submitterEmail,
      toolName: tool.name,
    });

    revalidateSubmissionPaths();

    return { success: true, data: { slug: tool.slug } };
  } catch {
    return {
      success: false,
      error: "Failed to submit tool. Please try again later.",
    };
  }
}
