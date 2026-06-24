import { buildImageKitUrl } from "@/lib/imagekit/client";
import { siteConfig } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";
import type { DirectoryToolDetail } from "@/types/directory";
import type { PricingModel } from "@/generated/prisma/client";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function serializeJsonLd(data: Record<string, unknown> | unknown[]) {
  return JSON.stringify(data);
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/opengraph-image"),
    sameAs: [siteConfig.links.twitter, siteConfig.links.github],
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/tools?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function buildSoftwareApplicationOffers(pricingModel: PricingModel) {
  if (pricingModel === "FREE") {
    return {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    };
  }

  return {
    "@type": "Offer",
    price: 0,
    priceCurrency: "USD",
    description: pricingModel,
    availability: "https://schema.org/InStock",
  };
}

export function buildSoftwareApplicationSchema(
  tool: DirectoryToolDetail & {
    twitterUrl?: string | null;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
    discordUrl?: string | null;
  },
) {
  const image =
    tool.logo != null
      ? buildImageKitUrl(tool.logo, "card")
      : tool.images[0]?.imageUrl != null
        ? buildImageKitUrl(tool.images[0].imageUrl, "screenshot")
        : undefined;

  const sameAs = [
    tool.websiteUrl,
    tool.twitterUrl,
    tool.linkedinUrl,
    tool.youtubeUrl,
    tool.discordUrl,
  ].filter((url): url is string => Boolean(url?.trim()));

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.shortDescription,
    applicationCategory: tool.category.name,
    operatingSystem: "Web",
    url: absoluteUrl(`/tools/${tool.slug}`),
    ...(image ? { image } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    offers: buildSoftwareApplicationOffers(tool.pricingModel),
  };
}
