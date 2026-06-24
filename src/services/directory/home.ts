import type { HomePageData } from "@/types/directory";
import { getPopularDirectoryCategories } from "@/services/directory/categories";
import { getPublishedToolCount } from "@/services/directory/shared";
import {
  getFeaturedDirectoryTools,
  getLatestDirectoryTools,
  getPopularSearchTools,
} from "@/services/directory/tools";
import { getPopularDirectoryTags } from "@/services/directory/tags";

export async function getHomePageData(): Promise<HomePageData> {
  const [
    totalTools,
    featuredTools,
    latestTools,
    popularCategories,
    popularTags,
    popularSearches,
  ] = await Promise.all([
    getPublishedToolCount(),
    getFeaturedDirectoryTools(6),
    getLatestDirectoryTools(6),
    getPopularDirectoryCategories(6),
    getPopularDirectoryTags(12),
    getPopularSearchTools(4),
  ]);

  return {
    totalTools,
    featuredTools,
    latestTools,
    popularCategories,
    popularTags,
    popularSearches,
  };
}
