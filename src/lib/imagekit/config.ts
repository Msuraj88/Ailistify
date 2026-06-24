function getUrlEndpoint(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, "") ??
    process.env.IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, "")
  );
}

export function isImageKitConfigured(): boolean {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY?.trim() &&
    process.env.IMAGEKIT_PRIVATE_KEY?.trim() &&
    getUrlEndpoint(),
  );
}

export function getImageKitConfig() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim();
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
  const urlEndpoint = getUrlEndpoint();

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit environment variables are not configured.");
  }

  return { publicKey, privateKey, urlEndpoint };
}

export function getPublicImageKitConfig() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim() ?? "";
  const urlEndpoint = getUrlEndpoint() ?? "";

  return { publicKey, urlEndpoint, configured: isImageKitConfigured() };
}
