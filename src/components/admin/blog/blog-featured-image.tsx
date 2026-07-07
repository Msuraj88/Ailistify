"use client";

import { deleteImageKitAsset } from "@/actions/admin/imagekit";
import { ImageKitUpload } from "@/components/admin/tools/imagekit-upload";
import { BLOG_IMAGEKIT_FOLDER } from "@/lib/constants/blog";

type BlogFeaturedImageUploadProps = {
  value?: string | null;
  fileId?: string | null;
  onChange: (value: { url: string; fileId: string } | null) => void;
  disabled?: boolean;
};

export function BlogFeaturedImageUpload({
  value,
  fileId,
  onChange,
  disabled,
}: BlogFeaturedImageUploadProps) {
  return (
    <ImageKitUpload
      folder={BLOG_IMAGEKIT_FOLDER}
      value={value}
      fileId={fileId}
      onChange={onChange}
      onDeleteRemote={async (fileId) => {
        await deleteImageKitAsset(fileId);
      }}
      disabled={disabled}
      label="Featured image"
      description="Upload one featured image for this blog post. AI image generation is not used."
      previewPreset="screenshotThumb"
    />
  );
}
