"use server";

import { revalidatePath } from "next/cache";
import {
  ListingPlan,
  PaymentStatus,
  ToolStatus,
} from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { sendSubmissionReceivedEmail } from "@/lib/email/tool-submission";
import { isImageKitConfigured } from "@/lib/imagekit/config";
import { validateSubmitMedia } from "@/lib/imagekit/validate-media";
import { prisma } from "@/lib/prisma";
import { generateSubmissionId } from "@/lib/submission/id";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";
import {
  submitToolSchema,
  type SubmitToolInput,
} from "@/validations/submit-tool";

const PUBLIC_PATHS = ["/tools", "/admin/tools", "/submit", "/submit-tool"];

function revalidateSubmissionPaths() {
  for (const path of PUBLIC_PATHS) {
    revalidatePath(path);
  }
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

function validateImageKitMedia(
  logo: string | null,
  images: { imageUrl: string }[],
): string | null {
  if (!isImageKitConfigured()) {
    return null;
  }

  return validateSubmitMedia(logo, images);
}

function resolvePaymentStatus(listingPlan: ListingPlan): PaymentStatus {
  if (listingPlan === ListingPlan.FREE) {
    return PaymentStatus.NOT_REQUIRED;
  }

  return PaymentStatus.PENDING;
}

export async function submitTool(input: SubmitToolInput): Promise<
  ActionResult<{
    toolId: string;
    submissionId: string;
    slug: string;
    listingPlan: ListingPlan;
    paymentStatus: PaymentStatus;
  }>
> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "You must be signed in to submit a tool." };
  }

  const parsed = submitToolSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;
  const submitterEmail = data.submitterEmail.toLowerCase();
  const normalizedLogo = normalizeOptionalUrl(data.logo);
  const imageKitError = validateImageKitMedia(normalizedLogo, data.images);

  if (imageKitError) {
    return { success: false, error: imageKitError };
  }

  try {
    const [category, tagsValid, slug, submissionId] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId } }),
      validateTags(data.tagIds),
      resolveUniqueSlug(data.name),
      generateSubmissionId(),
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

    const listingPlan = data.listingPlan as ListingPlan;
    const paymentStatus = resolvePaymentStatus(listingPlan);

    const tool = await prisma.$transaction(async (tx) => {
      const created = await tx.tool.create({
        data: {
          name: data.name.trim(),
          slug,
          shortDescription: data.shortDescription.trim(),
          fullDescription: data.fullDescription.trim(),
          websiteUrl: data.websiteUrl.trim(),
          pricingUrl: normalizeOptionalUrl(data.pricingUrl),
          logo: normalizedLogo,
          twitterUrl: normalizeOptionalUrl(data.twitterUrl),
          linkedinUrl: normalizeOptionalUrl(data.linkedinUrl),
          youtubeUrl: normalizeOptionalUrl(data.youtubeUrl),
          discordUrl: normalizeOptionalUrl(data.discordUrl),
          metaTitle: normalizeOptionalText(data.metaTitle),
          metaDescription: normalizeOptionalText(data.metaDescription),
          pricingModel: data.pricingModel,
          categoryId: data.categoryId,
          submittedById: session.user.id,
          submitterEmail,
          status: ToolStatus.PENDING,
          listingPlan,
          paymentStatus,
          submissionId,
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

      if (data.images.length > 0) {
        await tx.toolImage.createMany({
          data: data.images.map((image, index) => ({
            toolId: created.id,
            imageUrl: image.imageUrl,
            altText: normalizeOptionalText(image.altText),
            caption: normalizeOptionalText(image.caption),
            sortOrder: image.sortOrder ?? index,
            isPrimary: index === 0,
          })),
        });
      }

      return created;
    });

    if (listingPlan === ListingPlan.FREE) {
      await sendSubmissionReceivedEmail({
        submitterEmail,
        toolName: tool.name,
        submissionId: tool.submissionId!,
      });
    }

    revalidateSubmissionPaths();

    return {
      success: true,
      data: {
        toolId: tool.id,
        submissionId: tool.submissionId!,
        slug: tool.slug,
        listingPlan: tool.listingPlan,
        paymentStatus: tool.paymentStatus,
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to submit tool. Please try again later.",
    };
  }
}

export async function finalizePaidSubmission(input: {
  toolId: string;
  orderId: string;
}): Promise<ActionResult<{ submissionId: string }>> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const tool = await prisma.tool.findUnique({
    where: { id: input.toolId },
    select: {
      id: true,
      submittedById: true,
      listingPlan: true,
      paymentStatus: true,
      submissionId: true,
    },
  });

  if (!tool || tool.submittedById !== session.user.id) {
    return { success: false, error: "Submission not found." };
  }

  if (tool.paymentStatus === PaymentStatus.PAID) {
    return {
      success: true,
      data: { submissionId: tool.submissionId! },
    };
  }

  const featuredUntil =
    tool.listingPlan === ListingPlan.FEATURED
      ? new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
      : null;

  await prisma.tool.update({
    where: { id: tool.id },
    data: {
      paymentStatus: PaymentStatus.PAID,
      paypalOrderId: input.orderId,
      featured: tool.listingPlan === ListingPlan.FEATURED,
      featuredUntil,
    },
  });

  revalidateSubmissionPaths();

  return {
    success: true,
    data: { submissionId: tool.submissionId! },
  };
}

export async function getSubmissionSummary(submissionId: string) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return prisma.tool.findFirst({
    where: {
      submissionId,
      submittedById: session.user.id,
    },
    select: {
      submissionId: true,
      name: true,
      listingPlan: true,
      paymentStatus: true,
      status: true,
    },
  });
}
