import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBestPageIcon } from "@/components/best/best-page-icon";
import type { BestPageDefinition } from "@/types/best";

type RelatedPagesProps = {
  pages: BestPageDefinition[];
};

export function RelatedPages({ pages }: RelatedPagesProps) {
  if (pages.length === 0) {
    return null;
  }

  return (
    <section id="related-pages" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Related Best AI Tools pages
        </h2>
        <p className="mt-2 text-muted-foreground">
          Continue exploring curated AI tool guides on AIListify.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pages.map((page) => {
          const Icon = getBestPageIcon(page.icon);

          return (
            <Link
              key={page.slug}
              href={`/best/${page.slug}`}
              className="group flex items-start gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold group-hover:text-primary">
                  {page.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {page.heroDescription}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                  Read guide
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
