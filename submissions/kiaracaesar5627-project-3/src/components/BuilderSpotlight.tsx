import Image from "next/image";
import Link from "next/link";
import type { Participant } from "@/lib/types";

export function BuilderSpotlight({ person }: { person: Participant }) {
  if (!person.publicProfile) return null;

  return (
    <div className="builder-spotlight">
      <div className="builder-spotlight-media">
        {person.avatarUrl ? (
          <Image
            src={person.avatarUrl}
            alt=""
            width={280}
            height={280}
            className="builder-spotlight-img"
            priority
          />
        ) : (
          <div className="builder-spotlight-fallback font-display">
            {person.name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="builder-spotlight-copy">
        <p className="section-kicker">Spotlight</p>
        <h3 className="font-display text-[clamp(2rem,4vw,3rem)] tracking-tight leading-[1.05]">
          {person.name}
        </h3>
        <p className="mt-2 font-mono text-sm text-[var(--fog)]">
          @{person.handle} · {person.campus}
        </p>
        <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-[var(--fog)]">
          {person.highlight || person.bio}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {person.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-chip">
              {skill}
            </span>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={`/people/${person.handle}`} className="btn btn-primary">
            Open full trail
          </Link>
          <a
            href={`https://github.com/${person.handle}`}
            className="btn btn-ghost"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
