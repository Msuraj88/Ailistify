import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Megaphone, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import { cn } from "@/lib/utils";
import type { DirectoryToolCard } from "@/types/directory";

type ToolCardProps = {
  tool: DirectoryToolCard;
};

function ToolLogo({ logo, name }: { logo: string | null; name: string }) {
  if (logo) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-background">
        <Image
          src={buildImageKitUrl(logo, "thumbnail")}
          alt={`${name} logo`}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold text-muted-foreground">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col transition-shadow hover:shadow-md",
        tool.sponsored &&
          "border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent shadow-sm ring-1 ring-amber-500/20",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <ToolLogo logo={tool.logo} name={tool.name} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg leading-tight">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="after:absolute after:inset-0 hover:text-primary"
                >
                  {tool.name}
                </Link>
              </CardTitle>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tool.sponsored && (
                <Badge className="gap-1 bg-amber-500 text-xs text-amber-950 hover:bg-amber-500">
                  <Megaphone className="h-3 w-3" aria-hidden="true" />
                  Sponsored
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {tool.category.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tool.pricingModel}
              </Badge>
              {tool.featured && (
                <Badge className="gap-1 text-xs">
                  <Star className="h-3 w-3" aria-hidden="true" />
                  Featured
                </Badge>
              )}
              {tool.verified && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <CardDescription className="line-clamp-3 flex-1 text-sm">
          {tool.shortDescription}
        </CardDescription>
        {tool.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tool.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.slug} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
