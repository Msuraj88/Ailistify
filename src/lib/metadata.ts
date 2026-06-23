import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export const siteConfig = {
  name: "AIListify",
  title: "AIListify — Discover the Best AI Tools",
  description:
    "Curated directory of the best AI tools for productivity, development, design, marketing, and more. Find, compare, and explore cutting-edge AI software.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
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

export function createMetadata(overrides?: Partial<Metadata>): Metadata {
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
          url: siteConfig.ogImage,
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
      images: [siteConfig.ogImage],
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
    ...overrides,
  };
}
