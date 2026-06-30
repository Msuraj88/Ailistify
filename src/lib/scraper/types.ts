export type ScrapedWebsiteContent = {
  url: string;
  title: string;
  metaDescription: string;
  openGraph: Record<string, string>;
  faviconUrl: string | null;
  logoCandidates: string[];
  navigationLinks: string[];
  pricingPageHints: string[];
  structuredData: string[];
  visibleText: string;
  cleanedText: string;
};
