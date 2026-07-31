import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DeveloperProfile } from "@/components/DeveloperProfile";
import { allHandles, getPerson } from "@/lib/people";
import { siteUrl } from "@/lib/links";

type Props = { params: Promise<{ handle: string }> };

export function generateStaticParams() {
  return allHandles().map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const person = getPerson(handle);
  if (!person) return { title: "Developer" };
  if (person.privacy === "private") {
    return {
      title: `Private · @${person.handle}`,
      description: "This participant opted out of a public showcase profile.",
    };
  }
  return {
    title: `${person.name} (@${person.handle})`,
    description: person.whyImHere.slice(0, 155),
    openGraph: {
      title: `${person.name} · Lighthouse`,
      description: person.whyImHere.slice(0, 155),
      url: siteUrl(`/developers/${person.handle}`),
    },
  };
}

export default async function DeveloperPage({ params }: Props) {
  const { handle } = await params;
  const person = getPerson(handle);
  if (!person) notFound();

  if (person.privacy === "private") {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 sm:px-8">
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            @{person.handle}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-bold">
            Private profile
          </h1>
          <p className="mt-4 text-[var(--ink-muted)]">
            This participant opted out of a public showcase page. Campus:{" "}
            {person.campus}. Contact the placement lead via{" "}
            <Link href="/partners" className="text-[var(--signal)] underline">
              Partners
            </Link>{" "}
            if you need a confidential intro path.
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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <DeveloperProfile person={person} />
      </main>
      <SiteFooter />
    </div>
  );
}
