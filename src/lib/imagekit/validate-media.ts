function getImageKitEndpoint(): string | null {
  const endpoint =
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim() ??
    process.env.IMAGEKIT_URL_ENDPOINT?.trim();

  return endpoint ? endpoint.replace(/\/$/, "") : null;
}

export function isSubmitMediaValidationEnabled(): boolean {
  return Boolean(getImageKitEndpoint());
}

export function validateSubmitMedia(
  logo: string | null | undefined,
  images: { imageUrl: string }[] = [],
): string | null {
  const endpoint = getImageKitEndpoint();

  if (!endpoint) {
    return null;
  }

  const normalizedLogo = logo?.trim();

  if (normalizedLogo && !normalizedLogo.startsWith(endpoint)) {
    return "Logo must be uploaded via the form uploader.";
  }

  for (const image of images) {
    if (!image.imageUrl.startsWith(endpoint)) {
      return "All gallery images must be uploaded via the form uploader.";
    }
  }

  return null;
}
