"use client";

import { useTransition } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { incrementToolClicks } from "@/actions/directory";
import { Button } from "@/components/ui/button";

type ToolOutboundButtonProps = {
  slug: string;
  href: string;
  label: string;
  variant?: "default" | "outline";
};

export function ToolOutboundButton({
  slug,
  href,
  label,
  variant = "default",
}: ToolOutboundButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await incrementToolClicks(slug);
      window.open(href, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}
