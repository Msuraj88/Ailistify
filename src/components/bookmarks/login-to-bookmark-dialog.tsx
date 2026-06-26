"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LoginToBookmarkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl: string;
  toolName: string;
};

export function LoginToBookmarkDialog({
  open,
  onOpenChange,
  callbackUrl,
  toolName,
}: LoginToBookmarkDialogProps) {
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bookmark className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle>Sign in to save bookmarks</DialogTitle>
          <DialogDescription>
            Create an account or sign in to bookmark {toolName} and access your
            saved tools anytime.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button asChild>
            <Link href={loginHref}>Sign in</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
