export type BeehiivConfig = {
  apiKey: string;
  publicationId: string;
};

export function getBeehiivConfig(): BeehiivConfig | null {
  const apiKey = process.env.BEEHIIV_API_KEY?.trim();
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID?.trim();

  if (!apiKey || !publicationId) {
    return null;
  }

  return { apiKey, publicationId };
}
