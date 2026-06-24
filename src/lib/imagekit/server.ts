import ImageKit from "@imagekit/nodejs";
import { getImageKitConfig, isImageKitConfigured } from "@/lib/imagekit/config";

let imagekitClient: ImageKit | null = null;

export function getImageKitClient(): ImageKit {
  if (!isImageKitConfigured()) {
    throw new Error(
      "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.",
    );
  }

  if (!imagekitClient) {
    const config = getImageKitConfig();
    imagekitClient = new ImageKit({
      privateKey: config.privateKey,
    });
  }

  return imagekitClient;
}

export function getImageKitAuthParameters() {
  const client = getImageKitClient();
  const auth = client.helper.getAuthenticationParameters();
  const config = getImageKitConfig();

  return {
    ...auth,
    publicKey: config.publicKey,
    urlEndpoint: config.urlEndpoint,
  };
}

export async function deleteImageKitFile(fileId: string) {
  const client = getImageKitClient();
  await client.files.bulk.delete({ fileIds: [fileId] });
}

export function isImageKitUrl(url: string): boolean {
  if (!isImageKitConfigured()) {
    return false;
  }

  const { urlEndpoint } = getImageKitConfig();
  return url.startsWith(urlEndpoint);
}

export function assertImageKitUrl(url: string, label: string) {
  if (!url) {
    return;
  }

  if (!isImageKitUrl(url)) {
    throw new Error(`${label} must be an ImageKit URL.`);
  }
}
