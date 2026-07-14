"use client";

import { useState } from "react";
import { ImageKitUpload } from "@/components/admin/tools/imagekit-upload";

const LOGO_FOLDER = "/ailistify/tools/logos";

type UserToolLogoUploadProps = {
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function UserToolLogoUpload({
  value,
  onChange,
  disabled = false,
}: UserToolLogoUploadProps) {
  const [fileId, setFileId] = useState<string | null>(null);

  return (
    <ImageKitUpload
      folder={LOGO_FOLDER}
      authEndpoint="/api/imagekit/auth/submit"
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

        setFileId(null);
        onChange("");
      }}
    />
  );
}
