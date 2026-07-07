export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTocItemsFromHtml(content: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const idCounts = new Map<string, number>();

  for (const match of content.matchAll(regex)) {
    const level = Number(match[1]) as 2 | 3;
    const text = stripHtml(match[2] ?? "");

    if (!text) {
      continue;
    }

    const baseId = slugifyHeading(text);
    const seen = idCounts.get(baseId) ?? 0;
    idCounts.set(baseId, seen + 1);

    const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`;
    items.push({ id, text, level });
  }

  return items;
}
