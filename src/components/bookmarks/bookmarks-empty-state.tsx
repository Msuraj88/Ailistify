import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookmarksEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Bookmark className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold">No bookmarked tools yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Save your favorite AI tools to access them quickly later.
      </p>
      <Button asChild className="mt-6">
        <Link href="/tools">Browse AI Tools</Link>
      </Button>
    </div>
  );
}
