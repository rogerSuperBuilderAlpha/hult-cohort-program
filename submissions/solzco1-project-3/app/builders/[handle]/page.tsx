import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { githubAvatar, githubUrl, URLS } from "@/lib/config";
import { getBuilder } from "@/lib/roster";
import { ProfileActions } from "./ProfileActions";

export const dynamic = "force-dynamic";

type Props = { params: { handle: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const builder = getBuilder(params.handle);
  if (!builder) return { title: "Builder not found" };
  return {
    title: builder.displayName,
    description: builder.bio,
  };
}

export default function BuilderProfilePage({ params }: Props) {
  const builder = getBuilder(params.handle);
  if (!builder || builder.privacy !== "public") notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/builders"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← All builders
      </Link>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <Image
          src={githubAvatar(builder.handle)}
          alt=""
          width={120}
          height={120}
          className="rounded-2xl border border-[var(--glass-border)]"
          unoptimized
        />
        <div>
          <h1 className="font-display text-3xl font-bold">{builder.displayName}</h1>
          <p className="font-mono text-[var(--accent)]">@{builder.handle}</p>
          <p className="mt-3 text-[var(--ink-muted)]">{builder.bio}</p>
          <ProfileActions builder={builder} />
        </div>
      </div>

      <section className="glass mt-10 rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Signature project</h2>
        <p className="mt-2 text-[var(--accent-2)]">{builder.signatureProject}</p>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">{builder.tagline}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">Tech stack</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {builder.skills.map((s) => (
            <span
              key={s}
              className="rounded-lg border border-[var(--glass-border)] px-3 py-1 font-mono text-xs"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">Links</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <a
              href={githubUrl(builder.handle)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              GitHub profile
            </a>
          </li>
          {builder.deploys?.pm && (
            <li>
              <a href={builder.deploys.pm} className="text-[var(--accent)] hover:underline">
                PM platform deploy
              </a>
            </li>
          )}
          {builder.deploys?.comms && (
            <li>
              <a href={builder.deploys.comms} className="text-[var(--accent)] hover:underline">
                Comms platform deploy
              </a>
            </li>
          )}
          <li>
            <a href={URLS.winningPm} className="text-[var(--ink-muted)] hover:underline">
              Cohort PM (Forth)
            </a>
          </li>
          <li>
            <a href={URLS.winningComms} className="text-[var(--ink-muted)] hover:underline">
              Cohort Comms
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
