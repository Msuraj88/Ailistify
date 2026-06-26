"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleBookmark } from "@/actions/bookmarks";
import { useBookmarks } from "@/components/bookmarks/bookmark-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  toolId: string;
  toolName: string;
  variant?: "icon" | "button";
  className?: string;
};

export function BookmarkButton({
  toolId,
  toolName,
  variant = "icon",
  className,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const { isBookmarked, setBookmarked, promptLogin } = useBookmarks();
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bookmarked = mounted ? isBookmarked(toolId) : false;
  const label = bookmarked ? "Remove bookmark" : "Save bookmark";

  async function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!session?.user) {
      promptLogin(toolName);
      return;
    }

    const previous = bookmarked;
    setBookmarked(toolId, !previous);
    setIsPending(true);

    try {
      const result = await toggleBookmark(toolId);

      if (!result.success) {
        setBookmarked(toolId, previous);
        toast.error(result.error);
        return;
      }

      setBookmarked(toolId, result.data.bookmarked);

      if (result.data.bookmarked) {
        toast.success(`Saved ${toolName} to your bookmarks`);
      } else {
        toast.success(`Removed ${toolName} from your bookmarks`);
      }
    } catch {
      setBookmarked(toolId, previous);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const icon = isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
  ) : (
    <Bookmark
      className={cn("h-4 w-4", bookmarked && "fill-current")}
      aria-hidden="true"
    />
  );

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant={bookmarked ? "default" : "outline"}
        size="sm"
        className={cn("gap-2", className)}
        onClick={handleToggle}
        disabled={isPending}
        aria-label={label}
        aria-pressed={bookmarked}
      >
        {icon}
        {bookmarked ? "Saved" : "Bookmark"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground",
        bookmarked && "text-primary hover:text-primary",
        className,
      )}
      onClick={handleToggle}
      disabled={isPending}
      aria-label={label}
      aria-pressed={bookmarked}
    >
      {icon}
    </Button>
  );
}
