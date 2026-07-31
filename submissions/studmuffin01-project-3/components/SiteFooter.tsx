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
      </div>
    </footer>
  );
}
