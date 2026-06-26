import type { Prisma } from "@/generated/prisma/client";
import { ToolStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  mapToolCard,
  PUBLISHED_TOOL_WHERE,
  toolCardSelect,
} from "@/services/directory/shared";
import type { BookmarkListResult } from "@/types/bookmarks";
import type { BookmarkFilters } from "@/validations/bookmarks";

function buildBookmarkSearchWhere(
  userId: string,
  filters: BookmarkFilters,
): Prisma.BookmarkWhereInput {
  const toolWhere: Prisma.ToolWhereInput = {
    ...PUBLISHED_TOOL_WHERE,
  };

  const query = filters.q?.trim();
  if (query) {
    toolWhere.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
    ];
  }

  return {
    userId,
    tool: toolWhere,
  };
}

function buildBookmarkOrderBy(
  sort: BookmarkFilters["sort"],
): Prisma.BookmarkOrderByWithRelationInput[] {
  switch (sort) {
    case "name":
      return [{ tool: { name: "asc" } }];
    case "updated":
      return [{ tool: { updatedAt: "desc" } }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function getUserBookmarkToolIds(
  userId: string,
): Promise<string[]> {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      tool: PUBLISHED_TOOL_WHERE,
    },
    select: { toolId: true },
  });

  return bookmarks.map((bookmark) => bookmark.toolId);
}

export async function isToolBookmarkedByUser(
  userId: string,
  toolId: string,
): Promise<boolean> {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_toolId: { userId, toolId },
    },
    select: { toolId: true },
  });

  return Boolean(bookmark);
}

export async function getUserBookmarks(
  userId: string,
  filters: BookmarkFilters,
): Promise<BookmarkListResult> {
  const where = buildBookmarkSearchWhere(userId, filters);
  const skip = (filters.page - 1) * filters.pageSize;
  const orderBy = buildBookmarkOrderBy(filters.sort);

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      skip,
      take: filters.pageSize,
      orderBy,
      select: {
        tool: {
          select: toolCardSelect,
        },
      },
    }),
    prisma.bookmark.count({ where }),
  ]);

  return {
    tools: bookmarks.map((bookmark) => mapToolCard(bookmark.tool)),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function getTotalBookmarkCount(): Promise<number> {
  return prisma.bookmark.count({
    where: {
      tool: { status: ToolStatus.PUBLISHED },
    },
  });
}

export async function getPublishedToolForBookmark(toolId: string) {
  return prisma.tool.findFirst({
    where: {
      id: toolId,
      ...PUBLISHED_TOOL_WHERE,
    },
    select: { id: true, name: true, slug: true },
  });
}
