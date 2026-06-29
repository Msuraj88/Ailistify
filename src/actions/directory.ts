"use server";

import { revalidatePath } from "next/cache";
import { ToolStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

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
