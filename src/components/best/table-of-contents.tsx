import Link from "next/link";

export type TocItem = {
  id: string;
  label: string;
};

type TableOfContentsProps = {
  items: TocItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-xl border bg-card p-5"
    >
      <p className="text-sm font-semibold">On this page</p>
      <ol className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="mr-2 text-xs text-muted-foreground/80">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
