import Link from "next/link";
import { LIGHTHOUSE_HERO_IMAGE } from "@/lib/hero";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/live", label: "Live" },
  { href: "/developers", label: "Developers" },
  { href: "/partners", label: "Partners" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/rsvp", label: "RSVP" },
];

type Props = {
  /** Transparent bar over the landing hero photo. */
  variant?: "default" | "hero";
};

export function SiteHeader({ variant = "default" }: Props) {
  const hero = variant === "hero";

  return (
    <header
      className={
        hero
          ? "relative z-20"
          : "relative z-20 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="/home"
          aria-label="Lighthouse home"
          className={`shrink-0 overflow-hidden border transition ${
            hero
              ? "border-white/35 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
              : "border-[var(--line-strong)]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LIGHTHOUSE_HERO_IMAGE}
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 object-cover object-[35%_40%] sm:h-10 sm:w-10"
          />
        </Link>

        <nav
          className={`flex items-center gap-1 font-[family-name:var(--font-jetbrains)] text-[11px] font-medium uppercase tracking-[0.14em] sm:gap-2 ${
            hero ? "text-white/80" : "text-[var(--ink-muted)]"
          }`}
        >
          <Link
            href="/home"
            className="px-2.5 py-2 transition hover:text-[var(--signal)] sm:px-3"
          >
            Home
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2.5 py-2 transition hover:text-[var(--signal)] sm:px-3"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className={
              hero
                ? "ml-1 border border-white/50 bg-black/25 px-3 py-2 text-white transition hover:border-[var(--signal)] hover:text-[var(--signal)]"
                : "ml-1 border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--ink)] transition hover:border-[var(--signal)] hover:text-[var(--signal)]"
            }
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
