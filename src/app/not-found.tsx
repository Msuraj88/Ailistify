import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNoIndexMetadata } from "@/lib/metadata";

export const metadata = createNoIndexMetadata({
  title: "Page Not Found",
  description:
    "The page you are looking for does not exist or may have been moved.",
  path: "/404",
});

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you requested could not be found. Try browsing the directory or
        searching for AI tools.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tools">
            <Search className="h-4 w-4" />
            Browse tools
          </Link>
        </Button>
      </div>
    </div>
  );
}
