import type { DirectoryToolCard } from "@/types/directory";

export type BookmarkListResult = {
  tools: DirectoryToolCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
