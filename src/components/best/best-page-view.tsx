import { BestHero } from "@/components/best/best-hero";
import { BestToolCard } from "@/components/best/best-tool-card";
import { BestBreadcrumbs } from "@/components/best/breadcrumbs";
import { BuyingGuide } from "@/components/best/buying-guide";
import { ComparisonTable } from "@/components/best/comparison-table";
import { CTASection } from "@/components/best/cta-section";
import { FAQSection } from "@/components/best/faq-section";
import { InternalLinks } from "@/components/best/internal-links";
import { RelatedPages } from "@/components/best/related-pages";
import { SeoIntroduction } from "@/components/best/seo-introduction";
import {
  TableOfContents,
  type TocItem,
} from "@/components/best/table-of-contents";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBestPageJsonLd } from "@/lib/seo/best-json-ld";
import type { BestPageDefinition, BestResolvedTool } from "@/types/best";

const TOC_ITEMS: TocItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "recommended-tools", label: "Recommended AI tools" },
  { id: "comparison", label: "Comparison table" },
  { id: "best-free", label: "Best free AI tools" },
  { id: "best-paid", label: "Best paid AI tools" },
  { id: "buying-guide", label: "Buying guide" },
  { id: "faq", label: "FAQs" },
  { id: "related-pages", label: "Related pages" },
  { id: "newsletter", label: "Newsletter" },
];

type BestPageViewProps = {
  page: BestPageDefinition;
  tools: BestResolvedTool[];
  freeTools: BestResolvedTool[];
  paidTools: BestResolvedTool[];
  relatedPages: BestPageDefinition[];
};

export function BestPageView({
  page,
  tools,
  freeTools,
  paidTools,
  relatedPages,
}: BestPageViewProps) {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <JsonLd data={buildBestPageJsonLd(page, tools)} />

      <BestBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Best AI Tools", path: "/best" },
          { name: page.title, path: `/best/${page.slug}` },
        ]}
      />

      <div className="space-y-12 lg:space-y-16">
        <BestHero title={page.heroTitle} description={page.heroDescription} />

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <TableOfContents items={TOC_ITEMS} />
          </aside>

          <div className="space-y-12 lg:space-y-16">
            <SeoIntroduction content={page.seoContent} />

            <section id="recommended-tools" className="scroll-mt-24 space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Recommended AI tools
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Product details load from the AIListify directory. Missing
                  listings are skipped automatically.
                </p>
              </div>

              {tools.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center">
                  <p className="text-sm font-medium">
                    No matching published tools yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add published tools for these slugs in the directory, then
                    rebuild.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {tools.map((tool, index) => (
                    <BestToolCard key={tool.id} tool={tool} rank={index + 1} />
                  ))}
                </div>
              )}
            </section>

            <ComparisonTable tools={tools} />

            <section id="best-free" className="scroll-mt-24 space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Best free AI tools
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Tools with FREE or FREEMIUM pricing from this shortlist.
                </p>
              </div>
              {freeTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No free or freemium tools matched in this list yet.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {freeTools.map((tool) => (
                    <BestToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </section>

            <section id="best-paid" className="scroll-mt-24 space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Best paid AI tools
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Paid, subscription, or contact-priced tools from this
                  shortlist.
                </p>
              </div>
              {paidTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No fully paid tools matched in this list yet.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {paidTools.map((tool) => (
                    <BestToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </section>

            <BuyingGuide guide={page.buyingGuide} />
            <FAQSection items={page.faq} />
            <RelatedPages pages={relatedPages} />
            <InternalLinks currentPath={`/best/${page.slug}`} />
            <CTASection />
          </div>
        </div>
      </div>
    </div>
  );
}
