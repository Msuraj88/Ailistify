"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GlobalSearchProps = {
  className?: string;
};

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();

    if (!q) {
      router.push("/tools");
      return;
    }

    router.push(`/tools?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full max-w-md", className)}
      role="search"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          name="q"
          placeholder="Search AI tools..."
          className="h-11 rounded-full border-0 bg-secondary pl-11 pr-4 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Search AI tools"
        />
      </div>
    </form>
  );
}
