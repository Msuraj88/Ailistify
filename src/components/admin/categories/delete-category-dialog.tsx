"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { deleteAdminCategory } from "@/actions/admin/categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteCategoryDialogProps = {
  categoryId: string;
  categoryName: string;
  toolCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  toolCount,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inUse = toolCount > 0;

  function handleDelete() {
    if (inUse) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteAdminCategory(categoryId);

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
          <DialogTitle>Delete category</DialogTitle>
          <DialogDescription>
            {inUse ? (
              <>
                <strong>{categoryName}</strong> is used by{" "}
                <strong>{toolCount}</strong> tool{toolCount === 1 ? "" : "s"}.
                You must reassign or remove those tools before this category can
                be deleted.
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{categoryName}</strong>?
                This action cannot be undone.
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
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {inUse ? "Close" : "Cancel"}
          </Button>
          {!inUse && (
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
                "Delete category"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
