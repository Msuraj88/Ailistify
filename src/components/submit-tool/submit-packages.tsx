"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SUBMIT_PLAN_PRICES } from "@/lib/constants/tools";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "priority",
    plan: "PRIORITY" as const,
    badge: "⭐ Most Popular",
    title: "Priority Listing",
    price: `$${SUBMIT_PLAN_PRICES.PRIORITY}`,
    priceLabel: "One-Time Payment",
    features: [
      "Published within 24 hours",
      "Priority review",
      "Permanent AIListify listing",
      "SEO indexed",
      "AI search optimized",
      "Priority support",
      "Included in our upcoming newsletter",
    ],
    buttonLabel: "Submit Your Tool",
    highlighted: true,
    premium: false,
  },
  {
    id: "featured",
    plan: "FEATURED" as const,
    badge: "🚀 Best Value",
    title: "Featured Listing",
    price: `$${SUBMIT_PLAN_PRICES.FEATURED}`,
    priceLabel: "Featured for 4 Weeks",
    features: [
      "Everything in Priority Listing",
      "Homepage Featured Placement",
      "Featured Badge",
      "Category Featured Placement",
      "Social Media Promotion",
      "Newsletter Spotlight",
      "Higher Search Visibility",
      "Only one homepage featured sponsor at a time",
    ],
    buttonLabel: "Get Featured",
    highlighted: false,
    premium: true,
  },
] as const;

export function SubmitPackages() {
  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Choose Your Listing
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Get your AI tool in front of thousands of founders, developers, and AI
          enthusiasts. Submit your tool, then complete secure checkout.
        </p>
      </header>

      <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "rounded-[20px] border bg-white p-6 transition-transform hover:scale-[1.01] hover:shadow-lg sm:p-8 dark:bg-card",
              plan.premium
                ? "border-transparent bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-amber-400/20 p-[1px]"
                : "border-gray-200/80",
            )}
          >
            <div
              className={cn(
                "h-full rounded-[19px] bg-white p-6 sm:p-7 dark:bg-card",
                plan.premium && "rounded-[19px]",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {plan.badge}
              </p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">{plan.title}</h2>
                <div className="text-right">
                  <p className="text-3xl font-bold">{plan.price}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.priceLabel}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={cn(
                  "mt-6 h-10 w-full rounded-full",
                  plan.highlighted || plan.premium
                    ? "bg-neutral-950 text-white hover:bg-neutral-800"
                    : "",
                )}
              >
                <Link href={`/my-tools/submit?plan=${plan.plan}`}>
                  {plan.buttonLabel}
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
