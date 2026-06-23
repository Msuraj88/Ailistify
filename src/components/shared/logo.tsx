import Link from "next/link";
import { Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/metadata";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-bold tracking-tight ${className ?? ""}`}
      aria-label={`${siteConfig.name} home`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </div>
      {showText && (
        <span className="text-lg sm:text-xl">
          AI<span className="text-primary">Listify</span>
        </span>
      )}
    </Link>
  );
}
