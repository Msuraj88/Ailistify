"use server";

import { revalidatePath } from "next/cache";
import { ToolStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import { newsletterSchema } from "@/validations";

export async function incrementToolViews(
  slug: string,
): Promise<ActionResult<void>> {
  try {
    const result = await prisma.tool.updateMany({
      where: { slug, status: ToolStatus.PUBLISHED },
      data: { views: { increment: 1 } },
    });

    if (result.count === 0) {
      return { success: false, error: "Tool not found." };
    }

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to track view." };
  }
}

export async function incrementToolClicks(
  slug: string,
): Promise<ActionResult<void>> {
  try {
    const result = await prisma.tool.updateMany({
      where: { slug, status: ToolStatus.PUBLISHED },
      data: { clicks: { increment: 1 } },
    });

    if (result.count === 0) {
      return { success: false, error: "Tool not found." };
    }

    revalidatePath(`/tools/${slug}`);

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to track click." };
  }
}

export async function subscribeNewsletter(
  email: string,
): Promise<ActionResult<void>> {
  const parsed = newsletterSchema.safeParse({ email });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email",
    };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      create: { email: parsed.data.email.toLowerCase() },
      update: {},
    });

    return { success: true, data: undefined };
  } catch {
    return {
      success: false,
      error: "Failed to subscribe. Please try again later.",
    };
  }
}
