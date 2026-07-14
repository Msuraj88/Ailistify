"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useAuthDialog } from "@/components/auth/auth-dialog-provider";
import { isAdmin } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type SubmitToolButtonProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
  label?: string;
  onNavigate?: () => void;
};

export function SubmitToolButton({
  className,
  size = "sm",
  fullWidth = false,
  label = "Submit Tool",
  onNavigate,
}: SubmitToolButtonProps) {
  const { data: session, status } = useSession();
  const { openLogin } = useAuthDialog();

  if (status === "loading") {
    return (
      <Button
        size={size}
        className={cn(fullWidth && "w-full", className)}
        disabled
      >
        {label}
      </Button>
    );
  }

  if (session?.user) {
    const href = isAdmin(session.user.role) ? "/admin/tools/new" : "/my-tools";

    return (
      <Button
        asChild
        size={size}
        className={cn(fullWidth && "w-full", className)}
      >
        <Link href={href} onClick={onNavigate}>
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      className={cn(fullWidth && "w-full", className)}
      onClick={() => {
        onNavigate?.();
        openLogin("/my-tools");
      }}
    >
      {label}
    </Button>
  );
}
