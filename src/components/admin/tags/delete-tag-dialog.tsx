"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { deleteAdminTag } from "@/actions/admin/tags";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteTagDialogProps = {
  tagId: string;
  tagName: string;
  toolCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTagDialog({
  tagId,
  tagName,
  toolCount,
  open,
  onOpenChange,
}: DeleteTagDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmedInUse, setConfirmedInUse] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inUse = toolCount > 0;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmedInUse(false);
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteAdminTag({
        id: tagId,
        confirmInUse: inUse && confirmedInUse,
      });

      if (!result.success) {
        if (inUse && !confirmedInUse) {
          setConfirmedInUse(true);
        }
        setError(result.error);
        return;
      }

      handleOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tag</DialogTitle>
          <DialogDescription>
            {inUse && !confirmedInUse ? (
              <>
                <strong>{tagName}</strong> is used by{" "}
                <strong>{toolCount}</strong> tool{toolCount === 1 ? "" : "s"}.
                Deleting will remove this tag from all associated tools.
              </>
            ) : inUse && confirmedInUse ? (
              <>
                Please confirm again: deleting <strong>{tagName}</strong> will
                remove it from <strong>{toolCount}</strong> tool
                {toolCount === 1 ? "" : "s"}. This cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{tagName}</strong>? This
                action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : inUse && !confirmedInUse ? (
              "Continue"
            ) : inUse && confirmedInUse ? (
              "Yes, delete tag"
            ) : (
              "Delete tag"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
