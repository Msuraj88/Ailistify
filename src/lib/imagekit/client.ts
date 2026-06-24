import { getPublicImageKitConfig } from "@/lib/imagekit/config";

export type ImageKitTransformPreset =
  | "thumbnail"
  | "logo"
  | "screenshot"
  | "screenshotThumb"
  | "card";

const TRANSFORMS: Record<ImageKitTransformPreset, string> = {
  thumbnail: "w-80,h-80,c-at_max,f-auto,q-80",
  logo: "w-96,h-96,c-at_max,f-auto,q-85",
  screenshot: "w-1200,c-at_max,f-auto,q-85",
  screenshotThumb: "w-320,h-200,c-at_max,f-auto,q-80",
  card: "w-640,h-360,c-at_max,f-auto,q-85",
};

function getEndpoint(): string {
  return getPublicImageKitConfig().urlEndpoint;
}

export function buildImageKitUrl(
  url: string,
  preset: ImageKitTransformPreset = "thumbnail",
): string {
  const endpoint = getEndpoint();

  if (!url || !endpoint || !url.startsWith(endpoint)) {
    return url;
  }

  const transformation = TRANSFORMS[preset];
  const path = url.slice(endpoint.length);

  if (path.startsWith("/tr:")) {
    return url;
  }

  return `${endpoint}/tr:${transformation}${path}`;
}

export function buildCustomImageKitUrl(url: string, transformation: string) {
  const endpoint = getEndpoint();

  if (!url || !endpoint || !url.startsWith(endpoint)) {
    return url;
  }

  const path = url.slice(endpoint.length);

  if (path.startsWith("/tr:")) {
    return url;
  }

  return `${endpoint}/tr:${transformation}${path}`;
}

export type ImageKitUploadAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
};

export type ImageKitUploadResult = {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  filePath: string;
};

export async function fetchImageKitAuth(): Promise<ImageKitUploadAuth> {
  const response = await fetch("/api/imagekit/auth", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      payload?.error ?? "Failed to get ImageKit upload credentials.",
    );
  }

  return response.json() as Promise<ImageKitUploadAuth>;
}

export async function uploadFileToImageKit(
  file: File,
  folder: string,
): Promise<ImageKitUploadResult> {
  const auth = await fetchImageKitAuth();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("folder", folder);
  formData.append("publicKey", auth.publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("token", auth.token);
  formData.append("useUniqueFileName", "true");

  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await response.json()) as ImageKitUploadResult & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Image upload failed.");
  }

  return payload;
}
