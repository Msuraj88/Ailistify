export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pick<T>(items: T[], index: number): T {
  return items[index % items.length]!;
}

export function logoUrl(name: string, slug: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(slug)}&backgroundColor=6366f1,8b5cf6,ec4899`;
}
