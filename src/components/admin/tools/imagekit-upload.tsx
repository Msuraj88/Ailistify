"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildImageKitUrl,
  uploadFileToImageKit,
  type ImageKitUploadResult,
} from "@/lib/imagekit/client";
import { validateImageFile } from "@/validations/imagekit";
import { Button } from "@/components/ui/button";

type ImageKitUploadProps = {
  folder: string;
  authEndpoint?: string;
  value?: string | null;
  fileId?: string | null;
  onChange: (value: { url: string; fileId: string } | null) => void;
  onDeleteRemote?: (fileId: string) => Promise<void>;
  disabled?: boolean;
  label?: string;
  description?: string;
  previewPreset?: "thumbnail" | "logo" | "screenshotThumb";
  className?: string;
  multiple?: false;
};

type ImageKitMultiUploadProps = {
  folder: string;
  authEndpoint?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  multiple: true;
  onUpload: (result: ImageKitUploadResult) => void;
};

type Props = ImageKitUploadProps | ImageKitMultiUploadProps;

export function ImageKitUpload(props: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) {
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        for (const file of list) {
          const validationError = validateImageFile(file);
          if (validationError) {
            throw new Error(validationError);
          }

          const authEndpoint =
            "authEndpoint" in props ? props.authEndpoint : undefined;
          const result = await uploadFileToImageKit(
            file,
            props.folder,
            authEndpoint,
          );

          if (props.multiple) {
            props.onUpload(result);
          } else {
            props.onChange({ url: result.url, fileId: result.fileId });
            break;
          }
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Upload failed. Please try again.",
        );
      } finally {
        setIsUploading(false);
        setIsDragging(false);
      }
    },
    [props],
  );

  async function handleRemove() {
    if (props.multiple || !props.onChange) {
      return;
    }

    if (props.fileId && props.onDeleteRemote) {
      await props.onDeleteRemote(props.fileId);
    }

    props.onChange(null);
  }

  const showSinglePreview =
    !props.multiple && "value" in props && Boolean(props.value);

  return (
    <div className={cn("space-y-3", props.className)}>
      {(props.label || props.description) && (
        <div>
          {props.label && (
            <p className="text-sm font-medium leading-none">{props.label}</p>
          )}
          {props.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {props.description}
            </p>
          )}
        </div>
      )}

      {showSinglePreview && props.value && !props.multiple && (
        <div className="flex items-start gap-4 rounded-lg border bg-muted/20 p-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-background">
            <Image
              src={buildImageKitUrl(
                props.value,
                props.previewPreset ?? "thumbnail",
              )}
              alt="Upload preview"
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="break-all text-xs text-muted-foreground">
              {props.value}
            </p>
            <div className="flex flex-wrap gap-2">
              <label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={props.disabled || isUploading}
                  onChange={(event) => {
                    if (event.target.files) {
                      void handleFiles(event.target.files);
                    }
                    event.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={props.disabled || isUploading}
                  asChild
                >
                  <span>Replace</span>
                </Button>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={props.disabled || isUploading}
                onClick={() => void handleRemove()}
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {(!showSinglePreview || props.multiple) && (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            if (props.disabled || isUploading) {
              return;
            }
            void handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
            isDragging && "border-primary bg-primary/5",
            (props.disabled || isUploading) && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={props.disabled || isUploading}
            multiple={props.multiple}
            onChange={(event) => {
              if (event.target.files) {
                void handleFiles(event.target.files);
              }
              event.target.value = "";
            }}
          />
          {isUploading ? (
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
          ) : props.multiple ? (
            <ImagePlus className="mb-3 h-8 w-8 text-muted-foreground" />
          ) : (
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          )}
          <p className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Drag and drop or click to upload"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, or WEBP up to 5MB
          </p>
        </label>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
