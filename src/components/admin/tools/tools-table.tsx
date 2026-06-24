"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
  BadgeCheck,
  X,
} from "lucide-react";
import { approveToolSubmission, publishTool } from "@/actions/admin/moderation";
import {
  toggleAdminToolFeatured,
  toggleAdminToolVerified,
} from "@/actions/admin/tools";
import { DeleteToolDialog } from "@/components/admin/tools/delete-tool-dialog";
import { RejectSubmissionDialog } from "@/components/admin/tools/reject-submission-dialog";
import { ToolStatusBadge } from "@/components/admin/tools/tool-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionResult } from "@/types";
import type { AdminToolListItem } from "@/types/admin-tools";

type ToolsTableProps = {
  tools: AdminToolListItem[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function ToolLogo({ logo, name }: { logo: string | null; name: string }) {
  if (logo) {
    return (
      <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-background">
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted text-xs font-medium text-muted-foreground">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function ToolRowActions({ tool }: { tool: AdminToolListItem }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isPendingSubmission = tool.status === "PENDING";
  const canPublish =
    tool.status === "PENDING" ||
    tool.status === "DRAFT" ||
    tool.status === "REJECTED";

  function runAction(action: () => Promise<ActionResult<unknown>>) {
    setActionError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setActionError(result.error ?? "Action failed.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {actionError && (
          <span className="max-w-[120px] truncate text-xs text-destructive">
            {actionError}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/tools/${tool.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/tools/${tool.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            {isPendingSubmission && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    runAction(() => approveToolSubmission(tool.id))
                  }
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve & publish
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRejectOpen(true)}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            {!isPendingSubmission && canPublish && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => runAction(() => publishTool(tool.id))}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => runAction(() => toggleAdminToolFeatured(tool.id))}
            >
              <Star className="mr-2 h-4 w-4" />
              {tool.featured ? "Unfeature" : "Feature"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => runAction(() => toggleAdminToolVerified(tool.id))}
            >
              <BadgeCheck className="mr-2 h-4 w-4" />
              {tool.verified ? "Unverify" : "Verify"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DeleteToolDialog
        toolId={tool.id}
        toolName={tool.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <RejectSubmissionDialog
        toolId={tool.id}
        toolName={tool.name}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}

export function ToolsTable({ tools }: ToolsTableProps) {
  if (tools.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm font-medium">No tools found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Logo</TableHead>
            <TableHead>Tool Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Pricing</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools.map((tool) => (
            <TableRow key={tool.id}>
              <TableCell>
                <ToolLogo logo={tool.logo} name={tool.name} />
              </TableCell>
              <TableCell>
                <div className="min-w-[140px]">
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.slug}</p>
                </div>
              </TableCell>
              <TableCell>{tool.category.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{tool.pricingModel}</Badge>
              </TableCell>
              <TableCell>
                <ToolStatusBadge status={tool.status} />
              </TableCell>
              <TableCell>
                {tool.featured ? (
                  <Badge>Yes</Badge>
                ) : (
                  <span className="text-muted-foreground">No</span>
                )}
              </TableCell>
              <TableCell>
                {tool.verified ? (
                  <Badge variant="outline">Yes</Badge>
                ) : (
                  <span className="text-muted-foreground">No</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {tool.views.toLocaleString()}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(tool.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <ToolRowActions tool={tool} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
