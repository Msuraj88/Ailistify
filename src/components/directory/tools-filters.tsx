"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { buildToolsDirectoryHref } from "@/lib/directory/url-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  tags: { name: string; slug: string; toolCount: number }[];
  basePath?: string;
};

const ALL_VALUE = "all";
const SEARCH_DEBOUNCE_MS = 400;

export function ToolsFilters({
  categories,
  tags,
  basePath = "/tools",
}: ToolsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? ALL_VALUE;
  const currentTag = searchParams.get("tag") ?? ALL_VALUE;
  const currentPricing = searchParams.get("pricing") ?? ALL_VALUE;
  const currentFeatured = searchParams.get("featured") ?? ALL_VALUE;
  const currentVerified = searchParams.get("verified") ?? ALL_VALUE;
  const currentSort = searchParams.get("sort") ?? "latest";

  const [searchQuery, setSearchQuery] = useState(currentQ);

  useEffect(() => {
    setSearchQuery(currentQ);
  }, [currentQ]);

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

  const debouncedSearch = useDebouncedCallback((query: string) => {
    pushHref({ q: query.trim() || null });
  }, SEARCH_DEBOUNCE_MS);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    debouncedSearch(value);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushHref({ q: searchQuery.trim() || null });
  }

  function clearFilters() {
    startTransition(() => {
      router.push(basePath);
    });
  }

  const hasActiveFilters =
    currentQ ||
    currentCategory !== ALL_VALUE ||
    currentTag !== ALL_VALUE ||
    currentPricing !== ALL_VALUE ||
    currentFeatured !== ALL_VALUE ||
    currentVerified !== ALL_VALUE ||
    currentSort !== "latest";

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by name, description, or tags..."
            className="pl-9"
            disabled={isPending}
            aria-label="Search tools"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            "Search"
          )}
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-2">
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

        <div className="space-y-2">
          <Label>Tag</Label>
          <Select
            value={currentTag}
            onValueChange={(value) => pushHref({ tag: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.slug} value={tag.slug}>
                  {tag.name} ({tag.toolCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
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

        <div className="space-y-2">
          <Label>Featured</Label>
          <Select
            value={currentFeatured}
            onValueChange={(value) => pushHref({ featured: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="All tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All tools</SelectItem>
              <SelectItem value="true">Featured only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Verified</Label>
          <Select
            value={currentVerified}
            onValueChange={(value) => pushHref({ verified: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="All tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All tools</SelectItem>
              <SelectItem value="true">Verified only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
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

      {hasActiveFilters && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {currentQ && <Badge variant="secondary">Search: {currentQ}</Badge>}
            {currentCategory !== ALL_VALUE && (
              <Badge variant="secondary">
                Category:{" "}
                {categories.find((c) => c.slug === currentCategory)?.name ??
                  currentCategory}
              </Badge>
            )}
            {currentTag !== ALL_VALUE && (
              <Badge variant="secondary">
                Tag:{" "}
                {tags.find((t) => t.slug === currentTag)?.name ?? currentTag}
              </Badge>
            )}
            {currentPricing !== ALL_VALUE && (
              <Badge variant="secondary">Pricing: {currentPricing}</Badge>
            )}
            {currentFeatured === "true" && (
              <Badge variant="secondary">Featured</Badge>
            )}
            {currentVerified === "true" && (
              <Badge variant="secondary">Verified</Badge>
            )}
            {currentSort !== "latest" && (
              <Badge variant="outline">Sort: {currentSort}</Badge>
            )}
          </div>
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
        </div>
      )}
    </div>
  );
}
