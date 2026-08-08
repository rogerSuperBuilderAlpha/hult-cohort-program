import Link from "next/link";
import { BookOpen } from "lucide-react";

import { brand } from "@/lib/homepage-data";
import { cn } from "@/lib/utils";

type LexLearnLogoProps = {
  className?: string;
};

export function LexLearnLogo({ className }: LexLearnLogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label={`${brand.name} home`}
    >
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-lex-navy/15 bg-white shadow-sm">
        <BookOpen
          className="size-5 text-lex-navy"
          strokeWidth={1.75}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-0 rounded-full border border-lex-gold/30"
          aria-hidden
        />
      </span>
      <span className="flex flex-col">
        <span className="font-serif text-xl font-semibold tracking-tight text-lex-navy">
          {brand.name}
        </span>
        <span className="text-xs text-lex-navy/70">{brand.tagline}</span>
      </span>
    </Link>
  );
}
