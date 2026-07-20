import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import type { BestResolvedTool } from "@/types/best";

type BestToolCardProps = {
  tool: BestResolvedTool;
  rank?: number;
};

function ToolLogo({ logo, name }: { logo: string | null; name: string }) {
  if (logo) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-background">
        <Image
          src={buildImageKitUrl(logo, "thumbnail")}
          alt={`${name} logo`}
          fill
          className="object-cover"
          sizes="48px"
          loading="lazy"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted text-sm font-semibold text-muted-foreground">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function BestToolCard({ tool, rank }: BestToolCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <ToolLogo logo={tool.logo} name={tool.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {rank != null && (
              <span className="text-xs font-semibold text-muted-foreground">
                #{rank}
              </span>
            )}
            <h3 className="text-lg font-semibold leading-tight">
              <Link href={`/tools/${tool.slug}`} className="hover:text-primary">
                {tool.name}
              </Link>
            </h3>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{tool.pricingModel}</Badge>
            <Badge variant="outline">{tool.category.name}</Badge>
            {tool.averageRating != null && (
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                {tool.averageRating}
                {tool.reviewCount > 0 ? ` (${tool.reviewCount})` : ""}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {tool.shortDescription}
      </p>

      {tool.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.slug} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="flex-1">
          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
            Visit Tool
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/tools/${tool.slug}`}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}
