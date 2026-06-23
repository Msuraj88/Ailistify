import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Curated directory of 500+ AI tools</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover the Best{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Tools
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Find, compare, and explore cutting-edge AI software for
            productivity, development, design, marketing, and more — all in one
            place.
          </p>

          <form
            action="/tools"
            method="get"
            className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
            role="search"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                name="q"
                placeholder="Search AI tools..."
                className="pl-10"
                aria-label="Search AI tools"
              />
            </div>
            <Button type="submit" className="sm:w-auto">
              Search
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Popular:</span>
            {["ChatGPT", "Midjourney", "Claude", "Copilot"].map((term) => (
              <Link
                key={term}
                href={`/tools?q=${encodeURIComponent(term)}`}
                className="rounded-full border px-3 py-1 transition-colors hover:border-primary hover:text-foreground"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
