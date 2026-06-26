"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { GlobalSearch } from "@/components/directory/global-search";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/constants";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:gap-8 lg:px-8">
        <div className="flex shrink-0 items-center gap-6 lg:gap-8">
          <Logo />

          <nav
            className="hidden items-center gap-5 md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <GlobalSearch className="max-w-lg" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <UserNav />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/submit-tool">Submit Tool</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          className="border-t px-4 py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-4">
            <GlobalSearch />
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Button asChild size="sm" className="w-full">
              <Link
                href="/submit-tool"
                onClick={() => setMobileMenuOpen(false)}
              >
                Submit Tool
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
