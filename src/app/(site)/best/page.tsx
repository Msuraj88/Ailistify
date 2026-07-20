import { BestCategoryCard } from "@/components/best/best-category-card";
import { BestBreadcrumbs } from "@/components/best/breadcrumbs";
import { CTASection } from "@/components/best/cta-section";
import { InternalLinks } from "@/components/best/internal-links";
import { JsonLd } from "@/components/seo/json-ld";
import { getBestPageCardSummaries } from "@/data/best-pages";
import { createSeoMetadata } from "@/lib/metadata";
import { buildBestIndexJsonLd } from "@/lib/seo/best-json-ld";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata = createSeoMetadata({
  title: "Best AI Tools — Curated Guides by Use Case",
  description:
    "Explore AIListify Best AI Tools guides for students, teachers, developers, designers, YouTube, marketing, coding, and resume building.",
  path: "/best",
});

export default function BestIndexPage() {
  const pages = getBestPageCardSummaries();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <JsonLd data={buildBestIndexJsonLd(pages)} />

      <BestBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Best AI Tools", path: "/best" },
        ]}
      />

      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Best AI Tools
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Premium SEO guides for the most searched AI tool use cases. Every
          recommendation resolves from the AIListify directory — one source of
          truth for logos, pricing, and descriptions.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {pages.map((page) => (
          <BestCategoryCard key={page.slug} page={page} />
        ))}
      </div>

      <div className="mt-14 space-y-10">
        <InternalLinks currentPath="/best" />
        <CTASection />
      </div>
    </div>
  );
}
