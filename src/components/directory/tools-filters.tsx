"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { buildToolsDirectoryHref } from "@/lib/directory/url-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRICING_MODELS } from "@/lib/constants/tools";

type ToolsFiltersProps = {
  categories: { name: string; slug: string; toolCount: number }[];
  basePath?: string;
};

const ALL_VALUE = "all";

export function ToolsFilters({
  categories,
  basePath = "/tools",
}: ToolsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") ?? ALL_VALUE;
  const currentPricing = searchParams.get("pricing") ?? ALL_VALUE;
  const currentSort = searchParams.get("sort") ?? "latest";

  function pushHref(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === ALL_VALUE) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");

    const next: Record<string, string | undefined> = {};
    params.forEach((value, key) => {
      next[key] = value;
    });

    const href = buildToolsDirectoryHref(
      {
        q: next.q,
        category: next.category,
        tag: next.tag,
        pricing: next.pricing as (typeof PRICING_MODELS)[number] | undefined,
        featured: next.featured === "true" ? true : undefined,
        verified: next.verified === "true" ? true : undefined,
        sort: (next.sort as "latest" | "views" | "clicks" | "name") ?? "latest",
      },
      { basePath },
    );

    startTransition(() => {
      router.push(href);
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push(basePath);
    });
  }

  const hasActiveFilters =
    currentCategory !== ALL_VALUE ||
    currentPricing !== ALL_VALUE ||
    currentSort !== "latest";

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 sm:w-52">
            <Label>Category</Label>
            <Select
              value={currentCategory}
              onValueChange={(value) => pushHref({ category: value })}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name} ({category.toolCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:w-52">
            <Label>Pricing</Label>
            <Select
              value={currentPricing}
              onValueChange={(value) => pushHref({ pricing: value })}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="All pricing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All pricing</SelectItem>
                {PRICING_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 sm:w-52 lg:ml-auto">
          <Label>Sort by</Label>
          <Select
            value={currentSort}
            onValueChange={(value) => pushHref({ sort: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="views">Most viewed</SelectItem>
              <SelectItem value="clicks">Most clicked</SelectItem>
              <SelectItem value="name">A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(hasActiveFilters || isPending) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {hasActiveFilters ? (
            <div className="flex flex-wrap gap-2">
              {currentCategory !== ALL_VALUE && (
                <Badge variant="secondary">
                  Category:{" "}
                  {categories.find((c) => c.slug === currentCategory)?.name ??
                    currentCategory}
                </Badge>
              )}
              {currentPricing !== ALL_VALUE && (
                <Badge variant="secondary">Pricing: {currentPricing}</Badge>
              )}
              {currentSort !== "latest" && (
                <Badge variant="outline">Sort: {currentSort}</Badge>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {isPending && (
              <Loader2
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            )}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={isPending}
                className="shrink-0"
              >
                <X className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
