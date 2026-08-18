"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileMenu } from "@/components/ProfileMenu";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/people", label: "Builders" },
  { href: "/work", label: "Evidence" },
  { href: "/partners", label: "Partners" },
  { href: "/rsvp", label: "Event" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-[rgba(11,15,20,0.72)] backdrop-blur-md">
      <div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-center justify-between gap-4 py-3.5">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-[var(--paper)] transition group-hover:text-[var(--signal)]">
            <span className="live-dot" aria-hidden />
            {SITE.name}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:gap-x-5">
          {LINKS.map((link) => {
            const current =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <ProfileMenu />
          <Link href="/partners/intro" className="btn btn-primary text-sm">
            Request intro
          </Link>
        </nav>
      </div>
    </header>
  );
}
