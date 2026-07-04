"use client";

import { ImageKitUpload } from "@/components/admin/tools/imagekit-upload";

const SUBMISSION_GALLERY_FOLDER = "/ailistify/submissions/gallery";
const SUBMISSION_AUTH_ENDPOINT = "/api/imagekit/auth/submit";

type SubmitToolGalleryUploadProps = {
  value: { imageUrl: string; sortOrder: number }[];
  onChange: (images: { imageUrl: string; sortOrder: number }[]) => void;
  disabled?: boolean;
};

export function SubmitToolGalleryUpload({
  value,
  onChange,
  disabled = false,
}: SubmitToolGalleryUploadProps) {
  function handleUpload(result: { url: string }) {
    onChange([
      ...value,
      {
        imageUrl: result.url,
        sortOrder: value.length,
      },
    ]);
  }

  function handleRemove(index: number) {
    onChange(
      value
        .filter((_, itemIndex) => itemIndex !== index)
        .map((image, itemIndex) => ({
          ...image,
          sortOrder: itemIndex,
        })),
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Gallery images</p>
        <p className="text-sm text-muted-foreground">
          Optional product screenshots. JPG, PNG, or WEBP up to 5MB each.
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((image, index) => (
            <div
              key={`${image.imageUrl}-${index}`}
              className="overflow-hidden rounded-xl border bg-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt={`Gallery image ${index + 1}`}
                className="aspect-video w-full object-cover"
              />
              <div className="flex justify-end p-2">
                <button
                  type="button"
                  className="text-xs font-medium text-destructive"
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageKitUpload
        folder={SUBMISSION_GALLERY_FOLDER}
        authEndpoint={SUBMISSION_AUTH_ENDPOINT}
        disabled={disabled}
        label="Add gallery image"
        description="Upload screenshots to showcase your product."
        previewPreset="screenshotThumb"
        onChange={(next) => {
          if (next?.url) {
            handleUpload({ url: next.url });
          }
        }}
      />
    </div>
  );
}
