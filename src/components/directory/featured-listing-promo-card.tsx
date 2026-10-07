import Link from "next/link";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURED_LISTING_HREF = "/promote/checkout?plan=FEATURED_LISTING";

const FOOTER_PILLS = [
  "Guaranteed Review",
  "Permanent Backlink",
  "Instant Traffic",
] as const;

export function FeaturedListingPromoCard({
  className,
}: {
  className?: string;
}) {
  return (
    <Link
      href={FEATURED_LISTING_HREF}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border/80 bg-card p-5 shadow-none transition-shadow hover:shadow-md",
        className,
      )}
      aria-label="Launching an AI Tool? Get a featured listing."
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-rose-50 text-base">
          <span aria-hidden="true">🚀</span>
        </div>

        <h3 className="shrink-0 text-base font-bold leading-tight tracking-tight text-foreground sm:text-lg">
          Launching an AI Tool?
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Promotion
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
            Paid
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white dark:bg-slate-100 dark:text-slate-900">
            <Rocket className="h-2.5 w-2.5" aria-hidden="true" />
            Boost CTR
          </span>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        Skip the 4-week manual queue. Get your tool seen instantly by thousands
        of high-intent B2B buyers, developers, and founders.
      </p>

      <div className="mt-4 border-t border-border/70 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {FOOTER_PILLS.map((label) => (
            <span
              key={label}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground/80"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
