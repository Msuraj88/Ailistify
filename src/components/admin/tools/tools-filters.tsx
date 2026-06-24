"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
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
import { PRICING_MODELS, TOOL_STATUSES } from "@/lib/constants/tools";

type ToolsFiltersProps = {
  categories: { id: string; name: string }[];
};

const ALL_VALUE = "all";

export function ToolsFilters({ categories }: ToolsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("categoryId") ?? ALL_VALUE;
  const currentStatus = searchParams.get("status") ?? ALL_VALUE;
  const currentPricing = searchParams.get("pricingModel") ?? ALL_VALUE;
  const currentFeatured = searchParams.get("featured") ?? ALL_VALUE;
  const currentSort = searchParams.get("sort") ?? "newest";

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
      router.push(query ? `/admin/tools?${query}` : "/admin/tools");
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
      router.push("/admin/tools");
    });
  }

  const hasActiveFilters =
    currentQ ||
    currentCategory !== ALL_VALUE ||
    currentStatus !== ALL_VALUE ||
    currentPricing !== ALL_VALUE ||
    currentFeatured !== ALL_VALUE ||
    currentSort !== "newest";

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={currentQ}
            placeholder="Search tools by name, slug, or description..."
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={currentCategory}
            onValueChange={(value) => updateParams({ categoryId: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={currentStatus}
            onValueChange={(value) => updateParams({ status: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
              {TOOL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pricing model</Label>
          <Select
            value={currentPricing}
            onValueChange={(value) => updateParams({ pricingModel: value })}
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
            onValueChange={(value) => updateParams({ featured: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="All tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All tools</SelectItem>
              <SelectItem value="true">Featured only</SelectItem>
              <SelectItem value="false">Not featured</SelectItem>
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
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="views">Most views</SelectItem>
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
