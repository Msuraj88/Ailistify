"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { rejectToolSubmission } from "@/actions/admin/moderation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RejectSubmissionDialogProps = {
  toolId: string;
  toolName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function RejectSubmissionDialog({
  toolId,
  toolName,
  open,
  onOpenChange,
  onSuccess,
}: RejectSubmissionDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectToolSubmission({ toolId, reason });
      if (!result.success) {
        setError(result.error);
        return;
      }

      setReason("");
      onOpenChange(false);
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject submission</DialogTitle>
          <DialogDescription>
            Reject <strong>{toolName}</strong> and notify the submitter by
            email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Reason (optional)</Label>
          <Textarea
            id="rejection-reason"
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why this submission was not approved..."
            disabled={isPending}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Rejecting...
              </>
            ) : (
              "Reject submission"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
