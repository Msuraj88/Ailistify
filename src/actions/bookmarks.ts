"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPublishedToolForBookmark,
  getUserBookmarks as getUserBookmarksService,
} from "@/services/bookmarks";
import type { ActionResult } from "@/types";
import type { BookmarkListResult } from "@/types/bookmarks";
import {
  bookmarkFiltersSchema,
  bookmarkToolIdSchema,
  type BookmarkFilters,
} from "@/validations/bookmarks";

function revalidateBookmarkPaths(toolSlug?: string) {
  revalidatePath("/bookmarks");
  revalidatePath("/tools");

  if (toolSlug) {
    revalidatePath(`/tools/${toolSlug}`);
  }

  revalidatePath("/admin");
}

async function requireUserAction(): Promise<ActionResult<{ userId: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to bookmark tools.",
    };
  }

  return { success: true, data: { userId: session.user.id } };
}

async function validatePublishedTool(
  toolId: string,
): Promise<ActionResult<{ name: string; slug: string }>> {
  const tool = await getPublishedToolForBookmark(toolId);

  if (!tool) {
    return { success: false, error: "Tool not found or not available." };
  }

  return { success: true, data: { name: tool.name, slug: tool.slug } };
}

export async function addBookmark(
  toolId: string,
): Promise<ActionResult<{ bookmarked: true }>> {
  const authResult = await requireUserAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = bookmarkToolIdSchema.safeParse({ toolId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid tool ID",
    };
  }

  const toolResult = await validatePublishedTool(parsed.data.toolId);
  if (!toolResult.success) {
    return toolResult;
  }

  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_toolId: {
          userId: authResult.data.userId,
          toolId: parsed.data.toolId,
        },
      },
    });

    if (existing) {
      return { success: true, data: { bookmarked: true } };
    }

    await prisma.bookmark.create({
      data: {
        userId: authResult.data.userId,
        toolId: parsed.data.toolId,
      },
    });

    revalidateBookmarkPaths(toolResult.data.slug);

    return { success: true, data: { bookmarked: true } };
  } catch {
    return {
      success: false,
      error: "Failed to save bookmark. Please try again.",
    };
  }
}

export async function removeBookmark(
  toolId: string,
): Promise<ActionResult<{ bookmarked: false }>> {
  const authResult = await requireUserAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = bookmarkToolIdSchema.safeParse({ toolId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid tool ID",
    };
  }

  try {
    const tool = await prisma.tool.findUnique({
      where: { id: parsed.data.toolId },
      select: { slug: true },
    });

    await prisma.bookmark.deleteMany({
      where: {
        userId: authResult.data.userId,
        toolId: parsed.data.toolId,
      },
    });

    revalidateBookmarkPaths(tool?.slug);

    return { success: true, data: { bookmarked: false } };
  } catch {
    return {
      success: false,
      error: "Failed to remove bookmark. Please try again.",
    };
  }
}

export async function toggleBookmark(
  toolId: string,
): Promise<ActionResult<{ bookmarked: boolean; toolName?: string }>> {
  const authResult = await requireUserAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = bookmarkToolIdSchema.safeParse({ toolId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid tool ID",
    };
  }

  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_toolId: {
          userId: authResult.data.userId,
          toolId: parsed.data.toolId,
        },
      },
    });

    if (existing) {
      const result = await removeBookmark(parsed.data.toolId);
      if (!result.success) {
        return result;
      }

      return { success: true, data: { bookmarked: false } };
    }

    const toolResult = await validatePublishedTool(parsed.data.toolId);
    if (!toolResult.success) {
      return toolResult;
    }

    const result = await addBookmark(parsed.data.toolId);
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: { bookmarked: true, toolName: toolResult.data.name },
    };
  } catch {
    return {
      success: false,
      error: "Failed to update bookmark. Please try again.",
    };
  }
}

export async function getUserBookmarks(
  filters: BookmarkFilters,
): Promise<ActionResult<BookmarkListResult>> {
  const authResult = await requireUserAction();
  if (!authResult.success) {
    return authResult;
  }

  const parsed = bookmarkFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid filters",
    };
  }

  try {
    const data = await getUserBookmarksService(
      authResult.data.userId,
      parsed.data,
    );

    return { success: true, data };
  } catch {
    return {
      success: false,
      error: "Failed to load bookmarks. Please try again.",
    };
  }
}
