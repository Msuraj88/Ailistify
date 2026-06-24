import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { ToolOutboundButton } from "@/components/directory/tool-outbound-button";
import { ToolViewTracker } from "@/components/directory/tool-view-tracker";
import { ToolsGrid } from "@/components/directory/tools-grid";
import { Badge } from "@/components/ui/badge";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import type { DirectoryToolCard, DirectoryToolDetail } from "@/types/directory";

type ToolDetailContentProps = {
  tool: DirectoryToolDetail;
  relatedTools: DirectoryToolCard[];
};

function ToolLogo({ logo, name }: { logo: string | null; name: string }) {
  if (logo) {
    return (
      <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-background sm:h-24 sm:w-24">
        <Image
          src={buildImageKitUrl(logo, "logo")}
          alt={`${name} logo`}
          fill
          className="object-cover"
          sizes="96px"
          priority
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-muted text-2xl font-bold text-muted-foreground sm:h-24 sm:w-24">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function ToolDetailContent({
  tool,
  relatedTools,
}: ToolDetailContentProps) {
  return (
    <>
      <ToolViewTracker slug={tool.slug} />

      <article className="space-y-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <ToolLogo logo={tool.logo} name={tool.name} />
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {tool.featured && (
                <Badge className="gap-1">
                  <Star className="h-3 w-3" aria-hidden="true" />
                  Featured
                </Badge>
              )}
              {tool.verified && (
                <Badge variant="outline" className="gap-1">
                  <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                  Verified
                </Badge>
              )}
              <Badge variant="secondary">{tool.pricingModel}</Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {tool.name}
            </h1>

            <p className="text-lg text-muted-foreground">
              {tool.shortDescription}
            </p>

            <div className="flex flex-wrap gap-3">
              <ToolOutboundButton
                slug={tool.slug}
                href={tool.websiteUrl}
                label="Visit Website"
              />
              {tool.pricingUrl && (
                <ToolOutboundButton
                  slug={tool.slug}
                  href={tool.pricingUrl}
                  label="View Pricing"
                  variant="outline"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Category:</span>
              <Link
                href={`/category/${tool.category.slug}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {tool.category.name}
              </Link>
            </div>

            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`}>
                    <Badge variant="outline">{tag.name}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        <section aria-labelledby="description-heading">
          <h2
            id="description-heading"
            className="mb-4 text-xl font-semibold tracking-tight"
          >
            About {tool.name}
          </h2>
          <div className="max-w-none whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {tool.fullDescription}
          </div>
        </section>

        {tool.images.length > 0 && (
          <section aria-labelledby="screenshots-heading">
            <h2
              id="screenshots-heading"
              className="mb-4 text-xl font-semibold tracking-tight"
            >
              Screenshots
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {tool.images.map((image) => (
                <figure
                  key={image.id}
                  className="overflow-hidden rounded-lg border bg-muted/30"
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={buildImageKitUrl(image.imageUrl, "screenshot")}
                      alt={image.altText ?? `${tool.name} screenshot`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                  </div>
                  {image.caption && (
                    <figcaption className="px-4 py-2 text-sm text-muted-foreground">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {relatedTools.length > 0 && (
          <section aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="mb-6 text-xl font-semibold tracking-tight"
            >
              Related Tools
            </h2>
            <ToolsGrid
              tools={relatedTools}
              emptyTitle="No related tools"
              emptyDescription=""
            />
          </section>
        )}
      </article>
    </>
  );
}
