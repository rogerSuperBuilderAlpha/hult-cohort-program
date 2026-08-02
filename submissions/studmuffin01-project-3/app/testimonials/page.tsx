import type { Metadata } from "next";
import Link from "next/link";
import { SampleDataBadge } from "@/components/SampleDataBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  TESTIMONIALS,
  TESTIMONIAL_KIND_LABEL,
  type TestimonialKind,
} from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Mentor feedback, partner feedback, peer recognition, and operator notes from the Hult Cohort Summer Pilot.",
};

const KIND_ORDER: TestimonialKind[] = [
  "partner",
  "mentor",
  "peer",
  "operator",
];

export default function TestimonialsPage() {
  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    label: TESTIMONIAL_KIND_LABEL[kind],
    items: TESTIMONIALS.filter((item) => item.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight">
          Testimonials
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">
          Social proof from mentors, hiring partners, peers, and operators —
          illustrative quotes for UX — marked Sample data until real partner
          feedback is wired.
        </p>

        <div className="mt-12 space-y-14">
          {grouped.map((group) => (
            <section key={group.kind}>
              <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight">
                {group.label}
              </h2>
              <ul className="mt-5 grid gap-4 lg:grid-cols-2">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-6"
                  >
                    <p className="font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--signal)]">
                      {TESTIMONIAL_KIND_LABEL[item.kind]}
                      {item.isDemo ? (
                        <SampleDataBadge compact className="ml-2" />
                      ) : null}
                    </p>
                    <blockquote className="mt-4 flex-1 text-base leading-relaxed text-[var(--ink)]">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <footer className="mt-5 border-t border-[var(--line)] pt-4">
                      <p className="text-sm font-medium text-[var(--ink)]">
                        {item.author}
                      </p>
                      <p className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ink-faint)]">
                        {item.role}
                        {item.org ? ` · ${item.org}` : ""}
                      </p>
                      {item.aboutHandle ? (
                        <Link
                          href={`/developers/${item.aboutHandle}`}
                          className="mt-2 inline-block font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--signal)] hover:underline"
                        >
                          View @{item.aboutHandle}
                        </Link>
                      ) : null}
                    </footer>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
