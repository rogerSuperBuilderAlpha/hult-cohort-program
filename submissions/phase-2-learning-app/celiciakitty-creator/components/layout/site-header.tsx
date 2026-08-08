"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Moon } from "lucide-react";

import { AuthHeaderActions } from "@/components/layout/auth-header-actions";
import { LexLearnLogo } from "@/components/home/lexlearn-logo";
import { Button } from "@/components/ui/button";
import { siteNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return pathname === "/";
  if (href === "/learn") {
    return pathname === "/learn" || pathname.startsWith("/learn/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${header.offsetHeight}px`
      );
    };

    syncHeaderHeight();

    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(header);
    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
    };
  }, [pathname]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-lex-navy/8 bg-lex-surface/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <LexLearnLogo />

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {siteNavigation.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium text-lex-navy/80 transition-colors hover:text-lex-navy",
                  active && "text-lex-navy"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-lex-gold"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-9 border-lex-navy/12 bg-white text-lex-navy shadow-sm hover:bg-lex-pale"
            aria-label="Toggle dark mode"
          >
            <Moon className="size-4" />
          </Button>
          <AuthHeaderActions />
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-lex-navy/6 px-4 py-2 md:hidden"
        aria-label="Mobile navigation"
      >
        {siteNavigation.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                active
                  ? "bg-lex-navy text-white"
                  : "bg-white text-lex-navy/80 ring-1 ring-lex-navy/10"
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
