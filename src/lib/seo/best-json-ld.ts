import { siteConfig } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";
import type { BestFaqItem, BestResolvedTool } from "@/types/best";
import type { BestPageDefinition } from "@/types/best";
import { buildOrganizationSchema } from "@/lib/seo/json-ld";

export function buildBestFaqSchema(faq: BestFaqItem[]) {
  if (faq.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBestItemListSchema(
  page: BestPageDefinition,
  tools: BestResolvedTool[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: page.title,
    description: page.description,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: absoluteUrl(`/tools/${tool.slug}`),
    })),
  };
}

export function buildBestCollectionPageSchema(page: BestPageDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    description: page.description,
    url: absoluteUrl(`/best/${page.slug}`),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function buildBestWebPageSchema(page: BestPageDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: absoluteUrl(`/best/${page.slug}`),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    about: {
      "@type": "Thing",
      name: page.heroTitle,
    },
  };
}

export function buildBestPageJsonLd(
  page: BestPageDefinition,
  tools: BestResolvedTool[],
) {
  return [
    buildOrganizationSchema(),
    buildBestWebPageSchema(page),
    buildBestCollectionPageSchema(page),
    buildBestItemListSchema(page, tools),
    buildBestFaqSchema(page.faq),
  ].filter(Boolean);
}

export function buildBestIndexJsonLd(
  pages: Array<{ title: string; description: string; href: string }>,
) {
  return [
    buildOrganizationSchema(),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Best AI Tools",
      description:
        "Curated Best AI Tools guides for students, teachers, developers, designers, YouTube, marketing, coding, and resume building.",
      url: absoluteUrl("/best"),
      hasPart: pages.map((page) => ({
        "@type": "WebPage",
        name: page.title,
        description: page.description,
        url: absoluteUrl(page.href),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Best AI Tools Guides",
      numberOfItems: pages.length,
      itemListElement: pages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.title,
        url: absoluteUrl(page.href),
      })),
    },
  ];
}
