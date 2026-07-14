"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Rocket } from "lucide-react";
import { toast } from "sonner";
import { upgradeMyToolListing } from "@/actions/submit-tool";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SUBMIT_PLAN_PRICES } from "@/lib/constants/tools";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import { cn } from "@/lib/utils";
import type { MyToolListItem } from "@/services/my-tools";

type MyToolsListProps = {
  tools: MyToolListItem[];
};

export function MyToolsList({ tools }: MyToolsListProps) {
  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="text-lg font-semibold">No tools submitted yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit your first AI tool to join the review queue.
        </p>
        <Button asChild className="mt-6">
          <Link href="/my-tools/submit">Submit Tool</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tools.map((tool) => (
        <MyToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

function MyToolCard({ tool }: { tool: MyToolListItem }) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgrading, setUpgrading] = useState<"PRIORITY" | "FEATURED" | null>(
    null,
  );

  async function handleUpgrade(plan: "PRIORITY" | "FEATURED") {
    setUpgrading(plan);
    try {
      const result = await upgradeMyToolListing(tool.id, plan);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Redirecting to premium checkout...");
      window.open(result.data.paymentUrl, "_blank", "noopener,noreferrer");
      setUpgradeOpen(false);
    } catch {
      toast.error("Could not start premium upgrade.");
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <article className="flex flex-col rounded-xl border bg-card p-5">
      <div className="flex gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {tool.logo ? (
            <Image
              src={buildImageKitUrl(tool.logo, "logo")}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Logo
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{tool.name}</h2>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                tool.queueLabel === "Queue" &&
                  "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
                tool.queueLabel === "Published" &&
                  "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
                tool.queueLabel === "Rejected" &&
                  "bg-destructive/10 text-destructive",
                tool.queueLabel === "Archived" &&
                  "bg-muted text-muted-foreground",
              )}
            >
              {tool.queueLabel}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {tool.shortDescription}
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {tool.estimatedReview}
          </p>
          {tool.category && (
            <p className="mt-1 text-xs text-muted-foreground">
              {tool.category.name} · {tool.listingPlan} plan
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tool.canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/my-tools/${tool.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
        {tool.status !== "PUBLISHED" && tool.status !== "ARCHIVED" && (
          <Button size="sm" onClick={() => setUpgradeOpen(true)}>
            <Rocket className="h-4 w-4" />
            Upgrade to Premium Launch
          </Button>
        )}
        {tool.status === "PUBLISHED" && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/tools/${tool.slug}`} target="_blank">
              View live
            </Link>
          </Button>
        )}
      </div>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium Launch</DialogTitle>
            <DialogDescription>
              Skip the free queue and get published faster with Priority or
              Featured listing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <button
              type="button"
              disabled={upgrading !== null}
              onClick={() => void handleUpgrade("PRIORITY")}
              className="rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
            >
              <p className="font-semibold">
                Priority Listing — ${SUBMIT_PLAN_PRICES.PRIORITY}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Published within 24 hours with priority review.
              </p>
              {upgrading === "PRIORITY" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Starting checkout...
                </p>
              )}
            </button>
            <button
              type="button"
              disabled={upgrading !== null}
              onClick={() => void handleUpgrade("FEATURED")}
              className="rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
            >
              <p className="font-semibold">
                Featured Listing — ${SUBMIT_PLAN_PRICES.FEATURED}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything in Priority plus homepage featured placement for 4
                weeks.
              </p>
              {upgrading === "FEATURED" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Starting checkout...
                </p>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
