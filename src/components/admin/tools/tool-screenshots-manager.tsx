"use client";

import Image from "next/image";
import { useState } from "react";
import { GripVertical, X } from "lucide-react";
import { deleteImageKitAsset } from "@/actions/admin/imagekit";
import { ImageKitUpload } from "@/components/admin/tools/imagekit-upload";
import { Button } from "@/components/ui/button";
import { buildImageKitUrl } from "@/lib/imagekit/client";
import { cn } from "@/lib/utils";
import type { ToolImageFormInput } from "@/validations/admin-tools";

const SCREENSHOTS_FOLDER = "/ailistify/tools/screenshots";

type ToolScreenshotsManagerProps = {
  value: ToolImageFormInput[];
  onChange: (images: ToolImageFormInput[]) => void;
  disabled?: boolean;
};

function normalizeSortOrder(images: ToolImageFormInput[]) {
  return images.map((image, index) => ({
    ...image,
    sortOrder: index,
  }));
}

export function ToolScreenshotsManager({
  value,
  onChange,
  disabled = false,
}: ToolScreenshotsManagerProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pendingFileIds, setPendingFileIds] = useState<Record<string, string>>(
    {},
  );

  function handleUpload(result: { fileId: string; url: string; name: string }) {
    const next = normalizeSortOrder([
      ...value,
      {
        imageUrl: result.url,
        altText: "",
        caption: "",
        sortOrder: value.length,
      },
    ]);

    setPendingFileIds((current) => ({
      ...current,
      [result.url]: result.fileId,
    }));
    onChange(next);
  }

  async function handleRemove(index: number) {
    const image = value[index];
    if (!image) {
      return;
    }

    const fileId = pendingFileIds[image.imageUrl];
    if (fileId) {
      await deleteImageKitAsset(fileId);
      setPendingFileIds((current) => {
        const next = { ...current };
        delete next[image.imageUrl];
        return next;
      });
    }

    onChange(
      normalizeSortOrder(value.filter((_, itemIndex) => itemIndex !== index)),
    );
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    if (!moved) {
      setDragIndex(null);
      return;
    }

    next.splice(targetIndex, 0, moved);
    onChange(normalizeSortOrder(next));
    setDragIndex(null);
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <ul className="space-y-3">
          {value.map((image, index) => (
            <li
              key={image.id ?? image.imageUrl}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-muted/20 p-3",
                dragIndex === index && "opacity-50",
              )}
            >
              <button
                type="button"
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
                aria-label={`Reorder screenshot ${index + 1}`}
                disabled={disabled}
              >
                <GripVertical className="h-5 w-5" />
              </button>

              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border bg-background">
                <Image
                  src={buildImageKitUrl(image.imageUrl, "screenshotThumb")}
                  alt={image.altText || `Screenshot ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  Screenshot {index + 1}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {image.imageUrl}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={() => void handleRemove(index)}
                aria-label={`Delete screenshot ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ImageKitUpload
        multiple
        folder={SCREENSHOTS_FOLDER}
        disabled={disabled}
        label="Add screenshots"
        description="Upload one or more images. Drag items to reorder after upload."
        onUpload={handleUpload}
      />
    </div>
  );
}
