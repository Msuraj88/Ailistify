"use client";

import { Suspense } from "react";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { UsersTable } from "@/components/admin/users/users-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminUserListItem } from "@/types/admin-users";

type UsersManagerProps = {
  users: AdminUserListItem[];
};

function SearchSkeleton() {
  return <Skeleton className="h-10 w-full" />;
}

export function UsersManager({ users }: UsersManagerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Users</h1>
        <p className="mt-1 text-muted-foreground">
          View registered users. Founders are users who have submitted a tool.
        </p>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <AdminSearchBar
          basePath="/admin/users"
          placeholder="Search users by name or email..."
        />
      </Suspense>

      <UsersTable users={users} />
    </div>
  );
}
