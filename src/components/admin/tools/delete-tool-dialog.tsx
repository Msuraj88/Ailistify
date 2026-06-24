"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { deleteAdminTool } from "@/actions/admin/tools";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteToolDialogProps = {
  toolId: string;
  toolName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteToolDialog({
  toolId,
  toolName,
  open,
  onOpenChange,
}: DeleteToolDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteAdminTool(toolId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tool</DialogTitle>
          <DialogDescription>
            Are you sure you want to archive <strong>{toolName}</strong>? This
            will soft-delete the tool by setting its status to ARCHIVED and
            remove it from featured listings.
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
            onClick={() => onOpenChange(false)}
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
            ) : (
              "Delete tool"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
