"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
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
};

const ALL_VALUE = "all";

export function ToolsFilters({ categories, tags }: ToolsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? ALL_VALUE;
  const currentTag = searchParams.get("tag") ?? ALL_VALUE;
  const currentPricing = searchParams.get("pricing") ?? ALL_VALUE;
  const currentSort = searchParams.get("sort") ?? "latest";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === ALL_VALUE) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `/tools?${query}` : "/tools");
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();
    updateParams({ q: q || null });
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/tools");
    });
  }

  const hasActiveFilters =
    currentQ ||
    currentCategory !== ALL_VALUE ||
    currentTag !== ALL_VALUE ||
    currentPricing !== ALL_VALUE ||
    currentSort !== "latest";

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={currentQ}
            placeholder="Search tools..."
            className="pl-9"
            disabled={isPending}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={currentCategory}
            onValueChange={(value) => updateParams({ category: value })}
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
            onValueChange={(value) => updateParams({ tag: value })}
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
            onValueChange={(value) => updateParams({ pricing: value })}
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
          <Label>Sort by</Label>
          <Select
            value={currentSort}
            onValueChange={(value) => updateParams({ sort: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="views">Most viewed</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
