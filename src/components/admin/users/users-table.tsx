"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AdminUserListItem } from "@/types/admin-users";
import type { UserRole } from "@/generated/prisma/client";

type UsersTableProps = {
  users: AdminUserListItem[];
};

function formatSignedUpAt(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

const roleStyles: Record<UserRole, string> = {
  ADMIN:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  MODERATOR: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  USER: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant="outline" className={cn(roleStyles[role])}>
      {role}
    </Badge>
  );
}

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm font-medium">No users found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search or check back after new signups.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Tools submitted</TableHead>
            <TableHead>Signed up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {user.name?.trim() || "—"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                {user.isFounder ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  >
                    Founder
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">User</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={
                    user.submittedToolCount > 0 ? "default" : "secondary"
                  }
                >
                  {user.submittedToolCount}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatSignedUpAt(user.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
