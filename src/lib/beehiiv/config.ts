export type BeehiivConfig = {
  apiKey: string;
  publicationId: string;
};

/**
 * Beehiiv publication IDs must match `pub_{uuid}`.
 * The dashboard sometimes shows the UUID without the prefix.
 */
export function normalizeBeehiivPublicationId(publicationId: string): string {
  const trimmed = publicationId.trim();

  if (trimmed.startsWith("pub_")) {
    return trimmed;
  }

  return `pub_${trimmed}`;
}

export function getBeehiivConfig(): BeehiivConfig | null {
  const apiKey = process.env.BEEHIIV_API_KEY?.trim();
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID?.trim();

  if (!apiKey || !publicationId) {
    return null;
  }

  return {
    apiKey,
    publicationId: normalizeBeehiivPublicationId(publicationId),
  };
}
