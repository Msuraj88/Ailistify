import type {
  BestFooterLink,
  BestPageCardSummary,
  BestPageDefinition,
} from "@/types/best";
import { codingPage } from "@/data/best-pages/coding";
import { designersPage } from "@/data/best-pages/designers";
import { developersPage } from "@/data/best-pages/developers";
import { marketingPage } from "@/data/best-pages/marketing";
import { resumePage } from "@/data/best-pages/resume";
import { studentsPage } from "@/data/best-pages/students";
import { teachersPage } from "@/data/best-pages/teachers";
import { youtubePage } from "@/data/best-pages/youtube";

/**
 * Registry of all Best AI Tools pages.
 * To add a new page: create a file in this folder and append it here.
 */
export const BEST_PAGES: BestPageDefinition[] = [
  studentsPage,
  teachersPage,
  developersPage,
  designersPage,
  youtubePage,
  marketingPage,
  codingPage,
  resumePage,
];

const BEST_PAGES_BY_SLUG = new Map(
  BEST_PAGES.map((page) => [page.slug, page] as const),
);

export function getAllBestPages(): BestPageDefinition[] {
  return BEST_PAGES;
}

export function getBestPageBySlug(
  slug: string,
): BestPageDefinition | undefined {
  return BEST_PAGES_BY_SLUG.get(slug);
}

export function getAllBestPageSlugs(): string[] {
  return BEST_PAGES.map((page) => page.slug);
}

export function getBestPageCardSummaries(): BestPageCardSummary[] {
  return BEST_PAGES.map((page) => ({
    slug: page.slug,
    title: page.title,
    description: page.description,
    heroDescription: page.heroDescription,
    icon: page.icon,
    toolCount: page.toolSlugs.length,
    href: `/best/${page.slug}`,
  }));
}

/** Shared footer links — updates automatically when BEST_PAGES changes. */
export function getBestFooterLinks(): BestFooterLink[] {
  return BEST_PAGES.map((page) => ({
    href: `/best/${page.slug}`,
    label: page.title,
  }));
}

export function getRelatedBestPages(
  relatedSlugs: string[],
): BestPageDefinition[] {
  return relatedSlugs
    .map((slug) => BEST_PAGES_BY_SLUG.get(slug))
    .filter((page): page is BestPageDefinition => page != null);
}
