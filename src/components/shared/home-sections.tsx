import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { NewsletterForm } from "@/components/directory/newsletter-form";
import { CategoryCard } from "@/components/tools/category-card";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import type { HomePageData } from "@/types/directory";

type HomeSectionsProps = {
  data: HomePageData;
};

export function FeaturedToolsSection({
  tools,
}: {
  tools: HomePageData["featuredTools"];
}) {
  return (
    <section className="py-10" aria-labelledby="featured-tools-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2
            id="featured-tools-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Featured AI Tools
          </h2>
          <Button variant="outline" asChild>
            <Link href="/tools?featured=true">
              View all tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {tools.length === 0 ? (
          <EmptyState
            title="No featured tools yet"
            description="Check back soon for curated AI tool picks."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function LatestToolsSection({
  tools,
}: {
  tools: HomePageData["latestTools"];
}) {
  return (
    <section
      className="bg-muted/30 py-10"
      aria-labelledby="latest-tools-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2
            id="latest-tools-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Latest Tools
          </h2>
          <Button variant="outline" asChild>
            <Link href="/tools">
              Browse all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {tools.length === 0 ? (
          <EmptyState
            title="No tools published yet"
            description="New tools will appear here once approved."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CategoriesSection({
  categories,
}: {
  categories: HomePageData["popularCategories"];
}) {
  return (
    <section className="py-10" aria-labelledby="categories-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2
            id="categories-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Popular Categories
          </h2>
          <Button variant="outline" asChild>
            <Link href="/categories">View all categories</Link>
          </Button>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Categories will appear once tools are published."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="py-10" aria-labelledby="newsletter-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 px-6 py-10 text-center sm:px-12">
          <h2
            id="newsletter-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Stay ahead of the AI curve
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Get weekly picks of the best new AI tools, trending categories, and
            product updates delivered to your inbox.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeSections({ data }: HomeSectionsProps) {
  return (
    <>
      <FeaturedToolsSection tools={data.featuredTools} />
      <LatestToolsSection tools={data.latestTools} />
      <CategoriesSection categories={data.popularCategories} />
      <NewsletterSection />
    </>
  );
}
