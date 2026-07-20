import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";
import { FOOTER_LINKS } from "@/constants";
import { getBestFooterLinks } from "@/data/best-pages";
import { siteConfig } from "@/lib/metadata";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const bestLinks = getBestFooterLinks();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_repeat(2,minmax(0,1fr))]">
          <div className="max-w-md space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              {siteConfig.description.slice(0, 120)}...
            </p>
          </div>

          <nav aria-label="Footer navigation" className="space-y-3">
            <p className="text-sm font-semibold">Explore</p>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Best AI Tools" className="space-y-3">
            <p className="text-sm font-semibold">Best AI Tools</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/best"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  All Best Guides
                </Link>
              </li>
              {bestLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          >
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/refund"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Refund Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
