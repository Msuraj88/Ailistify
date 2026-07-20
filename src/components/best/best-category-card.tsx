import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBestPageIcon } from "@/components/best/best-page-icon";
import { Button } from "@/components/ui/button";
import type { BestPageCardSummary } from "@/types/best";

type BestCategoryCardProps = {
  page: BestPageCardSummary;
};

export function BestCategoryCard({ page }: BestCategoryCardProps) {
  const Icon = getBestPageIcon(page.icon);

  return (
    <article className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight">
        <Link href={page.href} className="hover:text-primary">
          {page.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {page.heroDescription}
      </p>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {page.toolCount} recommended tools
      </p>
      <Button asChild className="mt-5 w-full sm:w-auto">
        <Link href={page.href}>
          View guide
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
