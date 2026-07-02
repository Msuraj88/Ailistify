"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildPromoteStats,
  previousSponsors,
  promoteFaqs,
  promoteMeta,
  promotePackages,
  promoteSections,
  promoteStatsFooter,
  type PromoteSectionId,
  type PromoteStat,
} from "@/content/promote";
import { cn } from "@/lib/utils";

function buildMailto(subject: string) {
  return `mailto:${promoteMeta.contactEmail}?subject=${encodeURIComponent(subject)}`;
}

function PromoteStatsBanner({ stats }: { stats: PromoteStat[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100/80 bg-[radial-gradient(130%_120%_at_0%_100%,rgba(251,113,133,0.25)_0%,rgba(251,113,133,0)_45%),linear-gradient(115deg,rgba(253,242,248,0.95)_0%,rgba(254,243,199,0.95)_45%,rgba(238,242,255,0.95)_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-black shadow-sm">
              <stat.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {promoteStatsFooter}
      </p>
      <div className="mt-5 border-t border-white/60 pt-4">
        <p className="text-center text-base font-bold tracking-wide text-foreground">
          Previous Sponsors
        </p>
        <div className="mx-auto mt-3 flex w-fit flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-3 py-2 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.7)] backdrop-blur-sm">
          {previousSponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.website}
              target="_blank"
              rel="noreferrer"
              aria-label={`Visit ${sponsor.name}`}
              title={sponsor.name}
              className="group relative rounded-full transition-transform duration-200 hover:z-10 hover:scale-110 focus-visible:z-10 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border border-white/80 bg-white object-cover shadow-sm"
                unoptimized
              />
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/85 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                {sponsor.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromotePackageCard({
  pkg,
}: {
  pkg: (typeof promotePackages)[number];
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const Icon = pkg.icon;

  return (
    <article className="overflow-hidden rounded-[20px] border border-gray-200/80 bg-white">
      <div className="p-6 sm:p-8">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {pkg.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pkg.description}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {pkg.price}
                </p>
                {pkg.compareAtPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    {pkg.compareAtPrice}
                  </p>
                )}
              </div>
            </div>

            <ul className="space-y-2.5">
              {pkg.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-10 rounded-full bg-neutral-950 px-6 text-white hover:bg-neutral-800"
              >
                <a href={buildMailto(pkg.mailtoSubject)}>{pkg.ctaLabel}</a>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-10 gap-1.5 rounded-full border-gray-200 bg-white px-6 text-foreground hover:bg-gray-50"
                aria-expanded={previewOpen}
                onClick={() => setPreviewOpen((open) => !open)}
              >
                Preview
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    previewOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          previewOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t bg-muted/20 px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
            <div className="overflow-hidden rounded-xl border bg-background">
              <Image
                src={pkg.previewImage}
                alt={pkg.previewAlt}
                width={1200}
                height={520}
                className="h-auto w-full"
                unoptimized
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {pkg.previewDescription}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PromotePageContent() {
  const [activeSection, setActiveSection] =
    useState<PromoteSectionId>("opportunities");
  const statItems = buildPromoteStats();

  useEffect(() => {
    const sectionElements = promoteSections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sectionElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id as PromoteSectionId);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const element of sectionElements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  function scrollToSection(id: PromoteSectionId) {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:w-56 lg:shrink-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Sections
          </p>
          <nav aria-label="Promote page sections" className="space-y-1">
            {promoteSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  activeSection === section.id
                    ? "bg-white text-black"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-10">
          <header className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Website Sponsorship Opportunities
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Reach builders and teams browsing AIListify with high-visibility
              placements on the homepage and across product pages.
            </p>
          </header>

          <PromoteStatsBanner stats={statItems} />

          <section id="opportunities" className="scroll-mt-28 space-y-5">
            {promotePackages.map((pkg) => (
              <PromotePackageCard key={pkg.id} pkg={pkg} />
            ))}
          </section>

          <section id="faqs" className="scroll-mt-28 space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight">FAQs</h2>
            <div className="space-y-4">
              {promoteFaqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl bg-transparent p-0"
                >
                  <h3 className="font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
