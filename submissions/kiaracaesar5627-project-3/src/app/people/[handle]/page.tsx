import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EvidenceCard,
  ProfileSkillCloud,
} from "@/components/EvidenceCard";
import { PageHero } from "@/components/PageHero";
import { PersonTile } from "@/components/PersonTile";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  PARTICIPANTS,
  getParticipant,
  publicParticipants,
} from "@/lib/participants";

type Props = { params: Promise<{ handle: string }> };

export function generateStaticParams() {
  return PARTICIPANTS.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const person = getParticipant(handle);
  if (!person) return { title: "Profile" };
  if (!person.publicProfile) {
    return {
      title: "Private profile",
      description: `${person.handle} opted out of the public Trailmark roster.`,
    };
  }
  return {
    title: person.name,
    description: person.bio,
    openGraph: {
      title: `${person.name} · Trailmark`,
      description: person.highlight || person.bio,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { handle } = await params;
  const person = getParticipant(handle);
  if (!person) notFound();

  if (!person.publicProfile) {
    return (
      <section className="section !pt-28">
        <PageHero
          kicker="Privacy"
          title="This profile is private."
          lead={`@${person.handle} opted out of public display. Partners can still request a general intro via placement.`}
        >
          <Link href="/partners/intro" className="btn btn-primary">
            Request intro
          </Link>
        </PageHero>
      </section>
    );
  }

  const related = publicParticipants()
    .filter((p) => p.handle !== person.handle)
    .filter((p) => p.skills.some((s) => person.skills.includes(s)))
    .slice(0, 4);

  return (
    <>
      <section className="section !pt-24 !pb-6">
        <PageHero kicker={person.campus} title={person.name}>
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {person.avatarUrl ? (
              <Image
                src={person.avatarUrl}
                alt=""
                width={112}
                height={112}
                className="profile-avatar rounded-full bg-[var(--ink-3)]"
                priority
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm text-[var(--fog)]">
                @{person.handle}
              </p>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--fog)]">
                {person.bio}
              </p>
              {person.highlight ? (
                <p className="mt-4 max-w-2xl border-l-2 border-[var(--signal)] pl-4 text-[var(--paper)]">
                  {person.highlight}
                </p>
              ) : null}
              <div className="mt-6">
                <ProfileSkillCloud skills={person.skills} handle={person.handle} />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`https://github.com/${person.handle}`}
                  className="btn btn-primary btn-bounce"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                <Link
                  href={`/partners/intro?student=${person.handle}`}
                  className="btn btn-ghost"
                >
                  Request intro
                </Link>
              </div>
            </div>
          </div>
        </PageHero>
      </section>

      <section className="section !pt-8">
        <ScrollReveal>
          <p className="section-kicker">Evidence</p>
          <h2 className="!text-3xl">Projects &amp; deploys</h2>
        </ScrollReveal>
        <div className="mt-6 grid gap-4">
          {person.projects.map((project, i) => (
            <EvidenceCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section !pt-4 !pb-24">
          <ScrollReveal>
            <p className="section-kicker">Nearby builders</p>
            <h2 className="!text-3xl">Similar skill trails</h2>
          </ScrollReveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {related.map((p, i) => (
              <PersonTile key={p.handle} person={p} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
