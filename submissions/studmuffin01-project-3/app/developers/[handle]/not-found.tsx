import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function DeveloperNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-16 sm:px-8">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">
          Developer not found
        </h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          That handle is not on the Summer Pilot roster seed.
        </p>
        <Link
          href="/developers"
          className="mt-8 inline-block font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.12em] text-[var(--signal)]"
        >
          ← Back to developers
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
