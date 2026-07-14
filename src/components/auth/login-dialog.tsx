"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl?: string;
  googleAuthEnabled?: boolean;
};

export function LoginDialog({
  open,
  onOpenChange,
  callbackUrl = "/",
  googleAuthEnabled = false,
}: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>
            Sign in to your AIListify account to continue
          </DialogDescription>
        </DialogHeader>
        <LoginForm
          variant="modal"
          callbackUrl={callbackUrl}
          googleAuthEnabled={googleAuthEnabled}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
