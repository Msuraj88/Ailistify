"use server";

import { revalidatePath } from "next/cache";
import { ToolStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { submitToolSchema } from "@/validations";
import type { ActionResult } from "@/types";
import type { SubmitToolInput } from "@/validations";

export async function submitTool(
  input: SubmitToolInput,
): Promise<ActionResult<{ slug: string }>> {
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

  const { name, websiteUrl, description, categoryId } = parsed.data;
  const slug = slugify(name);

  try {
    const [existing, category] = await Promise.all([
      prisma.tool.findUnique({ where: { slug } }),
      prisma.category.findUnique({ where: { id: categoryId } }),
    ]);

    if (existing) {
      return {
        success: false,
        error: "A tool with this name already exists.",
      };
    }

    if (!category) {
      return { success: false, error: "Selected category does not exist." };
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        slug,
        shortDescription: description,
        fullDescription: description,
        websiteUrl,
        categoryId,
        submittedById: session.user.id,
        status: ToolStatus.PENDING,
        featured: false,
        verified: false,
      },
    });

    revalidatePath("/tools");
    revalidatePath("/submit");

    return { success: true, data: { slug: tool.slug } };
  } catch {
    return {
      success: false,
      error: "Failed to submit tool. Please try again later.",
    };
  }
}
