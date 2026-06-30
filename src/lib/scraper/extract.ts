import type { ScrapedWebsiteContent } from "@/lib/scraper/types";

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#\d+|#x[\da-fA-F]+|\w+);/g, (match) => {
    if (ENTITY_MAP[match]) {
      return ENTITY_MAP[match];
    }

    if (match.startsWith("&#x")) {
      const code = Number.parseInt(match.slice(3, -1), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }

    if (match.startsWith("&#")) {
      const code = Number.parseInt(match.slice(2, -1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }

    return match;
  });
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function getMetaContent(html: string, key: string, attr: "name" | "property") {
  const pattern = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["'][^>]*>`,
    "i",
  );

  return (
    html.match(pattern)?.[1] ??
    html.match(reversePattern)?.[1] ??
    ""
  ).trim();
}

function getTitle(html: string): string {
  const ogTitle = getMetaContent(html, "og:title", "property");
  if (ogTitle) {
    return ogTitle;
  }

  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? stripHtml(match[1]) : "";
}

function getOpenGraphTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const pattern =
    /<meta[^>]+property=["'](og:[^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;

  for (const match of html.matchAll(pattern)) {
    tags[match[1]] = decodeHtmlEntities(match[2].trim());
  }

  return tags;
}

function getStructuredData(html: string): string[] {
  const blocks: string[] = [];
  const pattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(pattern)) {
    const content = match[1]?.trim();
    if (content) {
      blocks.push(content.slice(0, 4000));
    }
  }

  return blocks;
}

function resolveUrl(baseUrl: string, candidate: string): string | null {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

function getLinkHref(html: string, rel: string): string | null {
  const pattern = new RegExp(
    `<link[^>]+rel=["'][^"']*${rel}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${rel}[^"']*["'][^>]*>`,
    "i",
  );

  return (
    html.match(pattern)?.[1] ??
    html.match(reversePattern)?.[1] ??
    ""
  ).trim();
}

function getLogoCandidates(
  html: string,
  baseUrl: string,
  openGraph: Record<string, string>,
): string[] {
  const candidates = new Set<string>();

  const push = (value?: string | null) => {
    if (!value) {
      return;
    }

    const resolved = resolveUrl(baseUrl, value);
    if (resolved) {
      candidates.add(resolved);
    }
  };

  push(openGraph["og:image"]);
  push(getLinkHref(html, "apple-touch-icon"));
  push(getLinkHref(html, "icon"));
  push(getLinkHref(html, "shortcut icon"));
  push("/favicon.ico");

  return Array.from(candidates);
}

function getNavigationLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  const pattern = /<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(pattern)) {
    const href = match[1]?.trim();
    const label = stripHtml(match[2] ?? "");

    if (!href || !label || label.length > 80) {
      continue;
    }

    const resolved = resolveUrl(baseUrl, href);
    if (resolved) {
      links.add(`${label} -> ${resolved}`);
    }
  }

  return Array.from(links).slice(0, 40);
}

function getPricingPageHints(navigationLinks: string[]): string[] {
  return navigationLinks.filter((link) =>
    /pricing|plans|subscribe|billing|cost/i.test(link),
  );
}

function buildCleanedText(content: Omit<ScrapedWebsiteContent, "cleanedText">) {
  const sections = [
    `URL: ${content.url}`,
    content.title ? `Title: ${content.title}` : "",
    content.metaDescription
      ? `Meta description: ${content.metaDescription}`
      : "",
    Object.keys(content.openGraph).length
      ? `OpenGraph: ${JSON.stringify(content.openGraph)}`
      : "",
    content.faviconUrl ? `Favicon: ${content.faviconUrl}` : "",
    content.logoCandidates.length
      ? `Logo candidates: ${content.logoCandidates.join(", ")}`
      : "",
    content.pricingPageHints.length
      ? `Pricing pages: ${content.pricingPageHints.join(" | ")}`
      : "",
    content.navigationLinks.length
      ? `Navigation: ${content.navigationLinks.slice(0, 20).join(" | ")}`
      : "",
    content.structuredData.length
      ? `Structured data: ${content.structuredData.join("\n")}`
      : "",
    content.visibleText ? `Visible text: ${content.visibleText}` : "",
  ].filter(Boolean);

  return sections.join("\n\n").slice(0, 14_000);
}

export function extractWebsiteContent(
  html: string,
  url: string,
): ScrapedWebsiteContent {
  const openGraph = getOpenGraphTags(html);
  const title = getTitle(html);
  const metaDescription =
    getMetaContent(html, "description", "name") ||
    openGraph["og:description"] ||
    "";
  const faviconHref =
    getLinkHref(html, "icon") || getLinkHref(html, "shortcut icon");
  const faviconUrl = faviconHref ? resolveUrl(url, faviconHref) : null;
  const logoCandidates = getLogoCandidates(html, url, openGraph);
  const navigationLinks = getNavigationLinks(html, url);
  const pricingPageHints = getPricingPageHints(navigationLinks);
  const structuredData = getStructuredData(html);
  const visibleText = stripHtml(html).slice(0, 10_000);

  const baseContent = {
    url,
    title,
    metaDescription,
    openGraph,
    faviconUrl,
    logoCandidates,
    navigationLinks,
    pricingPageHints,
    structuredData,
    visibleText,
  };

  return {
    ...baseContent,
    cleanedText: buildCleanedText(baseContent),
  };
}
