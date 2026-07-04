"use client";

import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SubmitAuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googleAuthEnabled?: boolean;
};

export function SubmitAuthModal({
  open,
  onOpenChange,
  googleAuthEnabled = false,
}: SubmitAuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[20px] p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="text-2xl">Submit Your AI Tool</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Reach thousands of AI enthusiasts and launch your product on
              AIListify.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            {googleAuthEnabled && <GoogleSignInButton callbackUrl="/submit" />}

            <Button asChild variant="outline" className="w-full rounded-full">
              <Link
                href="/register?callbackUrl=/submit"
                onClick={() => onOpenChange(false)}
              >
                Continue with Email
              </Link>
            </Button>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login?callbackUrl=/submit"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => onOpenChange(false)}
            >
              Sign In
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
