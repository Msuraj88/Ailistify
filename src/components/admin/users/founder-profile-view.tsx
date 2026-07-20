import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, Pencil } from "lucide-react";
import { ToolStatusBadge } from "@/components/admin/tools/tool-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminFounderProfile } from "@/types/admin-users";
import { cn } from "@/lib/utils";

type FounderProfileViewProps = {
  profile: AdminFounderProfile;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function FounderProfileView({ profile }: FounderProfileViewProps) {
  const displayName = profile.name?.trim() || "Unnamed user";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
              Back to users
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {displayName}
              </h1>
              {profile.isFounder && (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                >
                  Founder
                </Badge>
              )}
              <Badge variant="secondary">{profile.role}</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              Founder profile — submitted tools, contact, and submission stage.
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 rounded-lg border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Contact email
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {profile.email}
          </a>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Signed up
          </p>
          <p className="mt-1 text-sm font-medium">
            {formatDateTime(profile.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tools submitted
          </p>
          <p className="mt-1 text-sm font-medium">
            {profile.submittedToolCount}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Profile updated
          </p>
          <p className="mt-1 text-sm font-medium">
            {formatDateTime(profile.updatedAt)}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Submitted tools
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Status shows where each submission stopped in the pipeline.
          </p>
        </div>

        {profile.tools.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-sm font-medium">No tools submitted</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This user has not submitted any tools yet.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status / stage</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell>
                      <div className="min-w-0 max-w-[220px]">
                        <p className="truncate font-medium">{tool.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tool.slug}
                        </p>
                        {tool.submissionId && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            ID: {tool.submissionId}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tool.category.name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <ToolStatusBadge status={tool.status} />
                        <p className="text-xs font-medium">{tool.stageLabel}</p>
                        <p className="max-w-[180px] text-xs text-muted-foreground">
                          {tool.stageDetail}
                        </p>
                        {tool.rejectionReason && (
                          <p className="max-w-[180px] text-xs text-destructive">
                            Rejected: {tool.rejectionReason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tool.listingPlan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tool.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${tool.submitterEmail ?? profile.email}`}
                        className={cn(
                          "text-sm hover:text-primary",
                          !tool.submitterEmail && "text-muted-foreground",
                        )}
                      >
                        {tool.submitterEmail ?? profile.email}
                      </a>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(tool.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(tool.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/admin/tools/${tool.id}/edit`}
                            title="Edit tool"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit {tool.name}</span>
                          </Link>
                        </Button>
                        {tool.status === "PUBLISHED" && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`/tools/${tool.slug}`}
                              target="_blank"
                              title="View public page"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">View {tool.name}</span>
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
