import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export const siteConfig = {
  name: "AIListify",
  title: "AIListify — Discover the Best AI Tools",
  description:
    "Curated directory of the best AI tools for productivity, development, design, marketing, and more. Find, compare, and explore cutting-edge AI software.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/opengraph-image",
  keywords: [
    "AI tools",
    "artificial intelligence",
    "AI directory",
    "machine learning tools",
    "AI software",
    "productivity tools",
    "AI apps",
  ],
  links: {
    twitter: "https://twitter.com/ailistify",
    github: "https://github.com/ailistify",
  },
  creator: "AIListify",
} as const;

export type SeoMetadataOptions = {
  title: string;
  description: string;
  path: string;
  ogImage?: string | null;
  ogType?: "website" | "article";
  noIndex?: boolean;
  pagination?: {
    previous?: string;
    next?: string;
  };
};

function resolveOgImage(ogImage?: string | null) {
  if (ogImage?.trim()) {
    return ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);
  }

  return absoluteUrl(siteConfig.ogImage);
}

export function createSeoMetadata({
  title,
  description,
  path,
  ogImage,
  ogType = "website",
  noIndex = false,
  pagination,
}: SeoMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = resolveOgImage(ogImage);

  return createMetadata({
    title,
    description,
    alternates: { canonical: url },
    ...(pagination
      ? {
          pagination: {
            ...(pagination.previous
              ? { previous: absoluteUrl(pagination.previous) }
              : {}),
            ...(pagination.next ? { next: absoluteUrl(pagination.next) } : {}),
          },
        }
      : {}),
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        }
      : undefined,
    openGraph: {
      type: ogType,
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  });
}

export function createPageMetadata(options: SeoMetadataOptions): Metadata {
  return createSeoMetadata(options);
}

export function createNoIndexMetadata(options: SeoMetadataOptions): Metadata {
  return createSeoMetadata({ ...options, noIndex: true });
}

export function createMetadata(overrides?: Partial<Metadata>): Metadata {
  const defaultImage = absoluteUrl(siteConfig.ogImage);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteConfig.url,
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      images: [defaultImage],
      creator: "@ailistify",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: absoluteUrl("/"),
    },
    icons: {
      icon: "/logo-icon.png",
      shortcut: "/logo-icon.png",
      apple: "/logo-icon.png",
    },
    ...overrides,
  };
}
