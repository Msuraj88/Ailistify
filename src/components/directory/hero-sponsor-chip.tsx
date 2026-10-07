"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { incrementToolClicks } from "@/actions/directory";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import { cn } from "@/lib/utils";
import type { HeroSponsoredTool } from "@/types/directory";

const SPONSOR_SLOT_HREF = "/promote/checkout?plan=HOMEPAGE_SPONSOR";

type HeroSponsorChipProps = {
  tool: HeroSponsoredTool;
  className?: string;
};

type HeroSponsorAvailableChipProps = {
  className?: string;
};

function SponsorLogo({ logo, name }: { logo: string | null; name: string }) {
  if (logo) {
    return (
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-border/60 bg-white">
        <Image
          src={buildImageKitUrl(logo, "thumbnail")}
          alt={`${name} logo`}
          fill
          className="object-cover"
          sizes="28px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted text-[10px] font-semibold text-foreground">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function SponsorChipShell({
  className,
  children,
  label = "Sponsored by",
}: {
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[10px] font-semibold leading-tight text-gray-900 shadow-sm">
        {label}
      </span>

      <span className="inline-flex rounded-full bg-gradient-to-r from-yellow-200/70 via-rose-200/60 to-pink-200/70 p-[2px] shadow-[0_8px_24px_rgba(15,23,42,0.12),0_4px_12px_rgba(251,191,36,0.14)] transition-shadow group-hover:shadow-[0_10px_28px_rgba(15,23,42,0.16),0_6px_16px_rgba(244,114,182,0.16)]">
        <span className="inline-flex items-center gap-3 rounded-full bg-white py-3 pl-3 pr-6">
          {children}
        </span>
      </span>
    </span>
  );
}

export function HeroSponsorAvailableChip({
  className,
}: HeroSponsorAvailableChipProps) {
  return (
    <Link
      href={SPONSOR_SLOT_HREF}
      className={cn("inline-flex cursor-pointer", className)}
      aria-label="Sponsor this slot. Opens homepage sponsor checkout."
    >
      <SponsorChipShell label="Available">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted">
          <Sparkles
            className="h-3.5 w-3.5 text-foreground"
            aria-hidden="true"
          />
        </div>
        <span className="whitespace-nowrap text-sm font-bold text-foreground sm:text-base">
          Sponsor this slot
        </span>
      </SponsorChipShell>
    </Link>
  );
}

export function HeroSponsorChip({ tool, className }: HeroSponsorChipProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await incrementToolClicks(tool.slug);
      window.open(tool.websiteUrl, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      aria-label={`Sponsored by ${tool.name}. Opens website in a new tab.`}
    >
      <SponsorChipShell>
        <SponsorLogo logo={tool.logo} name={tool.name} />
        <span className="whitespace-nowrap text-sm font-semibold text-foreground sm:text-base">
          {tool.name}
        </span>
      </SponsorChipShell>
    </button>
  );
}
