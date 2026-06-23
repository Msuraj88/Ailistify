"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Loader2, LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isAdmin } from "@/lib/auth/roles";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Loading user">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Sign up</Link>
        </Button>
      </div>
    );
  }

  const admin = isAdmin(session.user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" aria-hidden="true" />
          <span className="hidden max-w-[120px] truncate sm:inline">
            {session.user.name ?? session.user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {session.user.email}
            </p>
            {session.user.role && (
              <p className="text-xs text-muted-foreground">
                Role: {session.user.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {admin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              Admin dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
