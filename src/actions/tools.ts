"use server";

import { revalidatePath } from "next/cache";
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

  const { name, websiteUrl, description, category, tags } = parsed.data;
  const slug = slugify(name);

  try {
    const existing = await prisma.tool.findUnique({ where: { slug } });

    if (existing) {
      return {
        success: false,
        error: "A tool with this name already exists.",
      };
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        slug,
        description,
        websiteUrl,
        category,
        tags,
        published: false,
        featured: false,
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
