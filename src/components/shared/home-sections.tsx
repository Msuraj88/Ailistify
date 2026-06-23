import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/tools/category-card";
import { ToolCard } from "@/components/tools/tool-card";
import { FEATURED_TOOLS_PLACEHOLDER, TOOL_CATEGORIES } from "@/constants";

export function FeaturedToolsSection() {
  return (
    <section
      className="py-16 sm:py-20"
      aria-labelledby="featured-tools-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2
              id="featured-tools-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Featured AI Tools
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked tools that are making waves in the AI space
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tools">
              View all tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_TOOLS_PLACEHOLDER.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section
      className="border-t bg-muted/30 py-16 sm:py-20"
      aria-labelledby="categories-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            id="categories-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Browse by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Find the perfect AI tool for your specific needs
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_CATEGORIES.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2
            id="cta-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Have an AI tool to share?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Submit your AI tool to AIListify and reach thousands of users
            looking for the next great AI solution.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/submit">Submit Your Tool</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
