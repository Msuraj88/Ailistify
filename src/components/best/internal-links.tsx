import Link from "next/link";

const INTERNAL_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "AI Tools" },
  { href: "/categories", label: "Categories" },
  { href: "/tags", label: "Tags" },
  { href: "/blog", label: "Blog" },
  { href: "/promote", label: "Promote" },
  { href: "/my-tools", label: "Submit a Tool" },
  { href: "/best", label: "Best AI Tools" },
] as const;

type InternalLinksProps = {
  currentPath?: string;
};

export function InternalLinks({ currentPath }: InternalLinksProps) {
  return (
    <section
      aria-label="Explore AIListify"
      className="rounded-xl border bg-muted/30 p-5"
    >
      <p className="text-sm font-semibold">Explore AIListify</p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {INTERNAL_LINKS.filter((link) => link.href !== currentPath).map(
          (link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
