export const IMAGEKIT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const IMAGEKIT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGEKIT_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export type ImageKitAllowedMimeType =
  (typeof IMAGEKIT_ALLOWED_MIME_TYPES)[number];

export function isAllowedImageMimeType(
  mimeType: string,
): mimeType is ImageKitAllowedMimeType {
  return IMAGEKIT_ALLOWED_MIME_TYPES.includes(
    mimeType as ImageKitAllowedMimeType,
  );
}

export function validateImageFile(file: File): string | null {
  if (!isAllowedImageMimeType(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  if (file.size > IMAGEKIT_MAX_FILE_SIZE_BYTES) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}
