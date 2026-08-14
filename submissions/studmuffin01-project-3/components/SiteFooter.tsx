import Link from "next/link";
import { COHORT } from "@/lib/cohort";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--bg-elevated)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <p className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--ink)]">
          Lighthouse
        </p>
        <p className="mt-1 max-w-md text-sm text-[var(--ink-muted)]">
          {COHORT.name} · {COHORT.term}. Public hiring surface — inspect the
          work, then request an intro.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          <Link href="/testimonials" className="hover:text-[var(--signal)]">
            Testimonials
          </Link>
          <Link href="/rsvp" className="hover:text-[var(--signal)]">
            Showcase RSVP
          </Link>
          <Link href="/signin" className="hover:text-[var(--signal)]">
            Sign in
          </Link>
        </p>
      </div>
    </footer>
  );
}
