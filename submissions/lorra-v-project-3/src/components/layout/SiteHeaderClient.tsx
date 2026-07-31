"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const nav = [
  {
    href: "/projects",
    label: "Projects",
    activeClass: "text-accent-projects after:bg-accent-projects",
  },
  {
    href: "/builders",
    label: "Builders",
    activeClass: "text-accent-builders after:bg-accent-builders",
  },
  {
    href: "/partners",
    label: "Partners",
    activeClass: "text-accent-partners after:bg-accent-partners",
  },
] as const;

type Props = {
  signedIn: boolean;
};

export function SiteHeaderClient({ signedIn }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const showFullNav = !isHome;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={[
        "z-30 w-full",
        isHome
          ? "absolute inset-x-0 top-0 border-transparent bg-transparent"
          : "relative border-b border-border/80 bg-background/80 backdrop-blur-md",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6">
        <Link
          href="/"
          className="shrink-0 font-display text-lg font-semibold tracking-tight"
        >
          <span className="text-foreground">Comen</span>
          <span className="text-accent-projects">tiq</span>
        </Link>

        {showFullNav ? (
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Primary"
          >
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "relative text-sm transition after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:transition",
                    active
                      ? `${item.activeClass} after:scale-x-100`
                      : "text-foreground-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <div className="flex items-center gap-2 sm:gap-3">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 cursor-pointer items-center rounded-md bg-accent-projects px-3 text-sm font-medium text-accent-foreground transition hover:brightness-110"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="cursor-pointer text-sm text-foreground-muted transition hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 cursor-pointer items-center rounded-md bg-accent-projects px-3 text-sm font-medium text-accent-foreground transition hover:brightness-110"
              >
                Join
              </Link>
            </>
          )}

          {showFullNav ? (
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-primary-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden className="text-lg leading-none">
                {menuOpen ? "×" : "☰"}
              </span>
            </button>
          ) : null}
        </div>
      </div>

      {showFullNav && menuOpen ? (
        <nav
          id="mobile-primary-nav"
          aria-label="Primary mobile"
          className="border-t border-border/80 bg-background/95 px-6 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "block rounded-md px-3 py-2.5 text-sm",
                      active
                        ? item.activeClass.split(" ")[0]
                        : "text-foreground-muted hover:bg-background-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
