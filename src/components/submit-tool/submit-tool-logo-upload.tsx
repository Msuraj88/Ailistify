"use client";

import { ImageKitUpload } from "@/components/admin/tools/imagekit-upload";

const SUBMISSION_LOGO_FOLDER = "/ailistify/submissions/logos";
const SUBMISSION_AUTH_ENDPOINT = "/api/imagekit/auth/submit";

type SubmitToolLogoUploadProps = {
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function SubmitToolLogoUpload({
  value,
  onChange,
  disabled = false,
}: SubmitToolLogoUploadProps) {
  return (
    <ImageKitUpload
      folder={SUBMISSION_LOGO_FOLDER}
      authEndpoint={SUBMISSION_AUTH_ENDPOINT}
      value={value}
      disabled={disabled}
      label="Tool logo"
      description="Optional. JPG, PNG, or WEBP up to 5MB."
      previewPreset="logo"
      onChange={(next) => {
        onChange(next?.url ?? "");
      }}
    />
  );
}
