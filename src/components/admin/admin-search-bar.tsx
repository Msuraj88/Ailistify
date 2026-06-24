"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminSearchBarProps = {
  placeholder?: string;
  basePath: string;
};

export function AdminSearchBar({
  placeholder = "Search...",
  basePath,
}: AdminSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentQ = searchParams.get("q") ?? "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${basePath}?${query}` : basePath);
    });
  }

  function clearSearch() {
    startTransition(() => {
      router.push(basePath);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={currentQ}
          placeholder={placeholder}
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
      {currentQ && (
        <Button
          type="button"
          variant="outline"
          onClick={clearSearch}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </form>
  );
}
