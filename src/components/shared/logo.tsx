import Image from "next/image";
import Link from "next/link";
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
      <Image
        src="/logo-icon.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8"
        priority
        aria-hidden="true"
      />
      {showText && (
        <span className="text-lg sm:text-xl">
          AI<span className="text-primary">Listify</span>
        </span>
      )}
    </Link>
  );
}
