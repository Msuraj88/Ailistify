"use client";

import {
  Bot,
  Mail,
  Newspaper,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const benefits = [
  { icon: Sparkles, label: "Permanent Tool Page" },
  { icon: Search, label: "SEO Indexed" },
  { icon: Bot, label: "AI Search Optimized" },
  { icon: Mail, label: "Newsletter Exposure" },
  { icon: Share2, label: "Social Media Promotion" },
  { icon: Users, label: "Thousands of Monthly Visitors" },
  { icon: TrendingUp, label: "Priority Review Available" },
];

export function SubmitBenefitsSidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-[20px] border border-gray-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Why Launch on AIListify?
        </h2>
        <ul className="mt-5 space-y-3.5">
          {benefits.map((benefit) => (
            <li
              key={benefit.label}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-foreground">
                <benefit.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="pt-1.5">{benefit.label}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50/70 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-violet-900">
            <Newspaper className="h-4 w-4" aria-hidden="true" />
            Built for AI product launches
          </div>
          <p className="mt-2 text-sm leading-relaxed text-violet-900/80">
            Get discovered by founders, developers, and teams actively searching
            for AI tools.
          </p>
        </div>
      </div>
    </aside>
  );
}
