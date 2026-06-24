"use client";

import { useState } from "react";
import { deleteImageKitAsset } from "@/actions/admin/imagekit";
import { ImageKitUpload } from "@/components/admin/tools/imagekit-upload";

const LOGO_FOLDER = "/ailistify/tools/logos";

type ToolLogoUploadProps = {
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function ToolLogoUpload({
  value,
  onChange,
  disabled = false,
}: ToolLogoUploadProps) {
  const [fileId, setFileId] = useState<string | null>(null);

  async function handleDeleteRemote(remoteFileId: string) {
    await deleteImageKitAsset(remoteFileId);
    setFileId(null);
  }

  return (
    <ImageKitUpload
      folder={LOGO_FOLDER}
      value={value}
      fileId={fileId}
      disabled={disabled}
      label="Tool logo"
      description="Upload a square logo. JPG, PNG, or WEBP up to 5MB."
      previewPreset="logo"
      onChange={(next) => {
        if (next) {
          setFileId(next.fileId);
          onChange(next.url);
          return;
        }

        onChange("");
      }}
      onDeleteRemote={handleDeleteRemote}
    />
  );
}
