import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type BestHeroProps = {
  title: string;
  description: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
};

export function BestHero({
  title,
  description,
  primaryCta = { href: "#recommended-tools", label: "See recommended tools" },
  secondaryCta = { href: "/tools", label: "Browse all AI tools" },
}: BestHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-muted/40 px-6 py-10 sm:px-10 sm:py-14">
      <div className="relative z-10 max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">
          Best AI Tools · AIListify
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={primaryCta.href}>
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
