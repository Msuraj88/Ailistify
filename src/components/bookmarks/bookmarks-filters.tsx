"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { buildBookmarksHref } from "@/lib/bookmarks/url-state";
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
import type { BookmarkFilters } from "@/validations/bookmarks";

const SEARCH_DEBOUNCE_MS = 400;

export function BookmarksFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const currentSort =
    (searchParams.get("sort") as BookmarkFilters["sort"] | null) ?? "recent";

  const [searchQuery, setSearchQuery] = useState(currentQ);

  useEffect(() => {
    setSearchQuery(currentQ);
  }, [currentQ]);

  function pushHref(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");

    const next: Partial<BookmarkFilters> = {
      q: params.get("q") ?? undefined,
      sort: (params.get("sort") as BookmarkFilters["sort"] | null) ?? "recent",
    };

    startTransition(() => {
      router.push(buildBookmarksHref(next));
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

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-end">
      <form className="flex-1 space-y-2" onSubmit={handleSearchSubmit}>
        <Label htmlFor="bookmark-search">Search bookmarks</Label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="bookmark-search"
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by tool name or description..."
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => {
                setSearchQuery("");
                pushHref({ q: null });
              }}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-2 sm:w-56">
        <Label htmlFor="bookmark-sort">Sort by</Label>
        <Select
          value={currentSort}
          onValueChange={(value) =>
            pushHref({ sort: value === "recent" ? null : value })
          }
        >
          <SelectTrigger id="bookmark-sort" aria-label="Sort bookmarks">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Bookmarked</SelectItem>
            <SelectItem value="name">Tool Name</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:pb-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Updating...
        </div>
      )}
    </div>
  );
}
