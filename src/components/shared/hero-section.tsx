import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { DirectoryCategoryCard } from "@/types/directory";

type HeroSectionProps = {
  totalTools: number;
  popularCategories: DirectoryCategoryCard[];
};

export function HeroSection({
  totalTools,
  popularCategories,
}: HeroSectionProps) {
  return (
    <section>
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-[url('/hero-gradient.png')] bg-cover bg-center px-6 py-8 text-center dark:bg-none dark:bg-gradient-to-br dark:from-card dark:to-secondary/40 sm:px-10 sm:py-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>
              Curated directory of {totalTools.toLocaleString()}+ AI tools
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover the Best{" "}
            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              AI Tools
            </span>
          </h1>

          {popularCategories.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {popularCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors hover:border-foreground/20 hover:bg-background"
                >
                  {category.name}{" "}
                  <span className="text-muted-foreground">
                    ({category.toolCount})
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
