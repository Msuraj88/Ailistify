"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MinusCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { bulkImportToolFromUrl } from "@/actions/admin/bulk-import";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { parseBulkImportUrls } from "@/lib/tools/parse-bulk-urls";
import { cn } from "@/lib/utils";
import type { BulkImportRow, BulkImportRowStatus } from "@/types/bulk-import";

const PLACEHOLDER = `https://cursor.com
https://perplexity.ai
https://bolt.new
https://lovable.dev`;

const RATE_LIMIT_DELAY_MS = 2500;

type BulkImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function createRows(urls: string[]): BulkImportRow[] {
  return urls.map((url) => ({
    url,
    status: "pending",
  }));
}

function isFinishedStatus(status: BulkImportRowStatus) {
  return (
    status === "imported" || status === "already_exists" || status === "failed"
  );
}

function StatusIcon({ status }: { status: BulkImportRowStatus }) {
  switch (status) {
    case "imported":
      return (
        <CheckCircle2
          className="h-4 w-4 shrink-0 text-emerald-600"
          aria-hidden="true"
        />
      );
    case "processing":
      return (
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin text-primary"
          aria-hidden="true"
        />
      );
    case "failed":
      return (
        <XCircle
          className="h-4 w-4 shrink-0 text-destructive"
          aria-hidden="true"
        />
      );
    case "already_exists":
      return (
        <MinusCircle
          className="h-4 w-4 shrink-0 text-amber-600"
          aria-hidden="true"
        />
      );
    default:
      return (
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/40"
          aria-hidden="true"
        />
      );
  }
}

function statusLabel(status: BulkImportRowStatus) {
  switch (status) {
    case "imported":
      return "Imported";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    case "already_exists":
      return "Already Exists";
    default:
      return "Pending";
  }
}

export function BulkImportDialog({
  open,
  onOpenChange,
}: BulkImportDialogProps) {
  const router = useRouter();
  const [urlText, setUrlText] = useState("");
  const [rows, setRows] = useState<BulkImportRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);

  const pauseRef = useRef(false);
  const stopRef = useRef(false);
  const rowsRef = useRef(rows);

  rowsRef.current = rows;

  const detectedUrls = useMemo(() => parseBulkImportUrls(urlText), [urlText]);
  const detectedCount = detectedUrls.length;

  const completedCount = rows.filter((row) =>
    isFinishedStatus(row.status),
  ).length;
  const progressPercent =
    rows.length > 0 ? Math.round((completedCount / rows.length) * 100) : 0;

  const summary = useMemo(() => {
    const imported = rows.filter((row) => row.status === "imported").length;
    const skipped = rows.filter(
      (row) => row.status === "already_exists",
    ).length;
    const failed = rows.filter((row) => row.status === "failed").length;

    return { imported, skipped, failed };
  }, [rows]);

  const updateRow = useCallback(
    (index: number, patch: Partial<BulkImportRow>) => {
      setRows((current) =>
        current.map((row, rowIndex) =>
          rowIndex === index ? { ...row, ...patch } : row,
        ),
      );
    },
    [],
  );

  const waitWhilePaused = useCallback(async () => {
    while (pauseRef.current) {
      if (stopRef.current) {
        return false;
      }

      await delay(150);
    }

    return !stopRef.current;
  }, []);

  const importSingleUrl = useCallback(
    async (url: string, index: number) => {
      updateRow(index, {
        status: "processing",
        error: undefined,
      });

      try {
        const result = await bulkImportToolFromUrl({ url });

        if (!result.success) {
          updateRow(index, {
            status: "failed",
            error: result.error,
          });
          return;
        }

        const data = result.data;

        if (data.status === "imported") {
          updateRow(index, {
            status: "imported",
            toolId: data.toolId,
            toolName: data.toolName,
          });
          return;
        }

        if (data.status === "already_exists") {
          updateRow(index, {
            status: "already_exists",
            toolId: data.toolId,
            toolName: data.toolName,
          });
          return;
        }

        updateRow(index, {
          status: "failed",
          error: data.error,
        });
      } catch {
        updateRow(index, {
          status: "failed",
          error: "Import failed. Please try again.",
        });
      }
    },
    [updateRow],
  );

  const runQueue = useCallback(
    async (startIndex = 0) => {
      const queue = rowsRef.current;

      for (let index = startIndex; index < queue.length; index += 1) {
        if (stopRef.current) {
          break;
        }

        const canContinue = await waitWhilePaused();
        if (!canContinue) {
          break;
        }

        const row = rowsRef.current[index];
        if (!row || isFinishedStatus(row.status)) {
          continue;
        }

        await importSingleUrl(row.url, index);

        if (stopRef.current) {
          break;
        }

        const hasMorePending = rowsRef.current
          .slice(index + 1)
          .some((item) => !isFinishedStatus(item.status));

        if (hasMorePending) {
          const canDelay = await waitWhilePaused();
          if (!canDelay) {
            break;
          }

          await delay(RATE_LIMIT_DELAY_MS);
        }
      }

      setIsImporting(false);
      setIsPaused(false);
      pauseRef.current = false;
      setFinishedAt(Date.now());
      setIsComplete(true);
      router.refresh();
    },
    [importSingleUrl, router, waitWhilePaused],
  );

  const handleStart = useCallback(async () => {
    const urls = parseBulkImportUrls(urlText);

    if (urls.length === 0) {
      return;
    }

    stopRef.current = false;
    pauseRef.current = false;
    setIsPaused(false);
    setIsComplete(false);
    setFinishedAt(null);
    setStartedAt(Date.now());
    setRows(createRows(urls));
    setIsImporting(true);

    window.setTimeout(() => {
      void runQueue(0);
    }, 0);
  }, [runQueue, urlText]);

  const handlePause = useCallback(() => {
    pauseRef.current = true;
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    if (!isImporting) {
      const resumeIndex = rowsRef.current.findIndex(
        (row) => !isFinishedStatus(row.status),
      );

      if (resumeIndex === -1) {
        return;
      }

      stopRef.current = false;
      pauseRef.current = false;
      setIsPaused(false);
      setIsImporting(true);
      setIsComplete(false);
      void runQueue(resumeIndex);
      return;
    }

    pauseRef.current = false;
    setIsPaused(false);
  }, [isImporting, runQueue]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
    pauseRef.current = false;
    setIsPaused(false);
  }, []);

  const handleRetry = useCallback(
    async (index: number) => {
      const row = rowsRef.current[index];
      if (!row) {
        return;
      }

      stopRef.current = false;
      pauseRef.current = false;
      setIsPaused(false);
      setIsComplete(false);
      setIsImporting(true);

      await importSingleUrl(row.url, index);
      setIsImporting(false);
      setFinishedAt(Date.now());
      setIsComplete(
        rowsRef.current.every((item) => isFinishedStatus(item.status)),
      );
      router.refresh();
    },
    [importSingleUrl, router],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isImporting) {
        return;
      }

      if (!nextOpen) {
        setUrlText("");
        setRows([]);
        setIsImporting(false);
        setIsPaused(false);
        setIsComplete(false);
        setStartedAt(null);
        setFinishedAt(null);
        stopRef.current = false;
        pauseRef.current = false;
      }

      onOpenChange(nextOpen);
    },
    [isImporting, onOpenChange],
  );

  const showSummary = isComplete && rows.length > 0;
  const totalDuration = startedAt && finishedAt ? finishedAt - startedAt : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <div className="space-y-2 border-b px-6 py-5">
          <DialogHeader>
            <DialogTitle>Bulk AI Import</DialogTitle>
            <DialogDescription>
              Paste one AI tool URL per line. AIListify will analyze and import
              each tool automatically.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Textarea
              value={urlText}
              onChange={(event) => setUrlText(event.target.value)}
              placeholder={PLACEHOLDER}
              rows={8}
              disabled={isImporting}
              className="min-h-[180px] font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              {detectedCount} URL{detectedCount === 1 ? "" : "s"} detected
            </p>
          </div>

          {rows.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {isImporting ? "Importing..." : "Import progress"}
                  </span>
                  <span className="text-muted-foreground">
                    {completedCount} / {rows.length} completed
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-2">
                {rows.map((row, index) => (
                  <div
                    key={`${row.url}-${index}`}
                    className="flex items-start gap-3 rounded-md px-2 py-2 text-sm"
                  >
                    <StatusIcon status={row.status} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs sm:text-sm">
                        {row.url}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            row.status === "imported" && "text-emerald-600",
                            row.status === "failed" && "text-destructive",
                            row.status === "already_exists" && "text-amber-600",
                            row.status === "processing" && "text-primary",
                            row.status === "pending" && "text-muted-foreground",
                          )}
                        >
                          {statusLabel(row.status)}
                        </span>
                        {row.toolName && row.toolId && (
                          <Link
                            href={`/admin/tools/${row.toolId}/edit`}
                            className="text-xs text-primary underline-offset-2 hover:underline"
                          >
                            {row.toolName}
                          </Link>
                        )}
                        {row.error && (
                          <span className="text-xs text-destructive">
                            {row.error}
                          </span>
                        )}
                      </div>
                    </div>
                    {row.status === "failed" && !isImporting && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => void handleRetry(index)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retry
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showSummary && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold">Summary</h3>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <p>Imported: {summary.imported}</p>
                <p>Skipped: {summary.skipped}</p>
                <p>Failed: {summary.failed}</p>
                {totalDuration !== null && (
                  <p>Total Time: {formatDuration(totalDuration)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {isImporting && !isPaused && (
              <Button type="button" variant="outline" onClick={handlePause}>
                Pause Import
              </Button>
            )}
            {isImporting && isPaused && (
              <Button type="button" variant="outline" onClick={handleResume}>
                Resume Import
              </Button>
            )}
            {isImporting && (
              <Button type="button" variant="outline" onClick={handleStop}>
                Stop Import
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isImporting}
              onClick={() => handleOpenChange(false)}
            >
              Close
            </Button>
            {!isImporting && !isComplete && (
              <Button
                type="button"
                disabled={detectedCount === 0}
                onClick={() => void handleStart()}
              >
                Start Import
              </Button>
            )}
            {!isImporting && isComplete && summary.failed > 0 && (
              <Button
                type="button"
                onClick={() => {
                  const nextRows = rowsRef.current.map((row) =>
                    row.status === "failed"
                      ? { ...row, status: "pending" as const, error: undefined }
                      : row,
                  );
                  setRows(nextRows);
                  setIsComplete(false);
                  setFinishedAt(null);
                  setStartedAt(Date.now());
                  setIsImporting(true);
                  stopRef.current = false;
                  pauseRef.current = false;
                  void runQueue(0);
                }}
              >
                Retry Failed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
