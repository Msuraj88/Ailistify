import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Rocket } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  howToPromoteFaqs,
  howToPromoteMeta,
} from "@/content/how-to-promote-my-ai-tool";
import { createSeoMetadata, siteConfig } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = createSeoMetadata({
  title: howToPromoteMeta.title,
  description: howToPromoteMeta.description,
  path: howToPromoteMeta.path,
  ogType: "article",
});

function buildArticleSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "How to Promote Your AI Tool in 2026: The Ultimate Distribution Playbook",
    description: howToPromoteMeta.description,
    keywords: [
      howToPromoteMeta.focusKeyword,
      ...howToPromoteMeta.secondaryKeywords,
    ].join(", "),
    datePublished: howToPromoteMeta.publishedAt,
    dateModified: howToPromoteMeta.updatedAt,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(howToPromoteMeta.path),
    },
  };
}

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: howToPromoteFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function PhaseCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border/80 bg-card p-6 sm:p-8 ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

export default function HowToPromoteMyAiToolPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <JsonLd data={buildArticleSchema()} />
      <JsonLd data={buildFaqSchema()} />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          {
            name: "How to Promote Your AI Tool",
            path: howToPromoteMeta.path,
          },
        ]}
      />

      <article className="space-y-10 text-[#1a202c] dark:text-foreground">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            AI tool marketing strategy
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            How to Promote Your AI Tool in 2026: The Ultimate Distribution
            Playbook
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-muted-foreground sm:text-lg">
            You shipped. The waitlist ballooned. Then… silence. Launch fatigue
            hits hard when founders burn weeks chasing Product Hunt timing,
            cold DMs, and directory queues that move like molasses. If you are
            asking{" "}
            <strong className="font-semibold text-[#1a202c] dark:text-foreground">
              how to promote my AI tool
            </strong>{" "}
            without burning runway, this playbook is your distribution stack —
            practical, sequenced, and built for getting traffic to an AI
            startup in 2026.
          </p>
        </header>

        <PhaseCard>
          <h2 className="text-2xl font-bold tracking-tight sm:text-[1.65rem]">
            Phase 1: Submitting to Top AI Tool Directories (The Fast Backlink
            Strategy)
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
            <p>
              Directories are the fastest compounding layer in an AI tool
              marketing strategy. One approved listing can unlock a permanent
              referral path, a crawlable URL, and buyers who already intend to
              evaluate software — not scroll past another LinkedIn post.
            </p>
            <ul className="space-y-2">
              {[
                "Prioritize curated directories with real editorial review over spammy link farms.",
                "Ship a crisp one-liner, category fit, and logo that reads at thumbnail size.",
                "Track referral UTM tags so you know which listings drive demos, not vanity visits.",
                "Queue paid fast-track options when organic review SLAs stretch past your launch window.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="mt-8 overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-amber-50 to-emerald-50 p-6 shadow-sm dark:border-orange-900/40 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-emerald-950/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700 shadow-sm dark:bg-background/80 dark:text-orange-300">
                  <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
                  AIListify fast track
                </p>
                <p className="text-base font-semibold leading-relaxed text-[#1a202c] dark:text-foreground sm:text-lg">
                  Want to skip the line entirely? Submit your tool to AIListify
                  for instant fast-track verification, permanent high-authority
                  backlinks, and immediate access to 4,000+ active tech buyers.
                </p>
              </div>
              <Link
                href="/my-tools/submit"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Submit your tool
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </PhaseCard>

        <PhaseCard>
          <h2 className="text-2xl font-bold tracking-tight sm:text-[1.65rem]">
            Phase 2: Launching on Product Hunt, LaunchingNext, and Hacker News
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
            <p>
              Launch platforms still move the needle when you treat them as a
              campaign, not a lottery ticket. Product Hunt, LaunchingNext, and
              Hacker News reward clarity, credibility, and community respect —
              especially when you are figuring out how to launch an AI SaaS
              without looking like another wrapper.
            </p>
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                <strong className="font-semibold text-[#1a202c] dark:text-foreground">
                  Pre-build social proof.
                </strong>{" "}
                Collect 10–20 early users, screenshots, and a short maker story
                before you hit “submit.”
              </li>
              <li>
                <strong className="font-semibold text-[#1a202c] dark:text-foreground">
                  Own the first four hours.
                </strong>{" "}
                Reply to every comment. Ship a founder AMA tone — not a press
                release.
              </li>
              <li>
                <strong className="font-semibold text-[#1a202c] dark:text-foreground">
                  Sequence secondary launches.
                </strong>{" "}
                Use Product Hunt for the spike, LaunchingNext for discovery
                linger, and Hacker News only when you have a technical
                narrative worth debating.
              </li>
            </ol>
          </div>
        </PhaseCard>

        <PhaseCard>
          <h2 className="text-2xl font-bold tracking-tight sm:text-[1.65rem]">
            Phase 3: Programmatic SEO and Content Marketing for AI Startups
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
            <p>
              Paid acquisition decays. SEO compounds. The winners who
              consistently get traffic to an AI startup build pages that answer
              buyer intent: comparisons, use-case guides, integration docs, and
              “best tools for X” content that earns links while converting
              evaluators.
            </p>
            <ul className="space-y-2">
              {[
                "Map keywords to jobs-to-be-done (“summarize meetings,” “generate ads”), not vanity model names.",
                "Publish one definitive pillar page, then spin supporting comparison and workflow posts.",
                "Use programmatic templates carefully — unique data, screenshots, and expert takes beat thin clones.",
                "Internally link from every high-intent page back to pricing and a single primary CTA.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </PhaseCard>

        <PhaseCard>
          <h2 className="text-2xl font-bold tracking-tight sm:text-[1.65rem]">
            Phase 4: Cold Outreach and Micro-Influencer Seed Partnerships
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
            <p>
              Distribution is still a people business. Cold outreach and
              micro-influencer seeds convert when the ask is specific, the
              asset is ready, and the creator already talks to your ICP.
            </p>
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                Build a list of 50 niche creators (newsletters, YouTube, indie
                X accounts) who cover AI workflows — not mega-celebrities.
              </li>
              <li>
                Lead with a free seat, unique angle, or early access, not a
                generic “would love your thoughts” email.
              </li>
              <li>
                Track replies, content live dates, and attributed signups.
                Double down on partners who move pipeline.
              </li>
            </ol>
            <p>
              Stack this phase after directories and launch day so creators see
              social proof, not a blank landing page.
            </p>
          </div>
        </PhaseCard>

        <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-slate-50 to-emerald-50/60 p-6 sm:p-8 dark:from-card dark:to-emerald-950/20">
          <h2 className="text-2xl font-bold tracking-tight">
            Put the playbook to work
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
            Stop waiting on backlog reviews. List on AIListify, sequence your
            launch platforms, publish SEO that sells, and seed the right
            creators. That is how to promote your AI tool in 2026 — with
            momentum, not hope.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/my-tools/submit"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Submit to AIListify
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/promote"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#1a202c] transition-colors hover:bg-slate-50 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted"
            >
              Explore promote options
            </Link>
          </div>
        </section>

        <section className="space-y-6" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-2xl font-bold tracking-tight sm:text-[1.65rem]"
          >
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {howToPromoteFaqs.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-border/80 bg-card p-5"
              >
                <h3 className="text-base font-semibold text-[#1a202c] dark:text-foreground">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-muted-foreground sm:text-base">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
