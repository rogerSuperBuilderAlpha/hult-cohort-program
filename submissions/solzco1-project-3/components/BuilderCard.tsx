"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Builder } from "@/lib/types";
import { githubAvatar, githubUrl } from "@/lib/config";
import { QuickConnectModal } from "./QuickConnectModal";

export function BuilderCard({ builder }: { builder: Builder }) {
  const [connectOpen, setConnectOpen] = useState(false);

  return (
    <>
      <article className="glass group flex flex-col rounded-2xl p-5 transition-all hover:border-[var(--accent)] hover:shadow-[0_0_30px_var(--glow)]">
        <div className="flex items-start gap-4">
          <Image
            src={githubAvatar(builder.handle)}
            alt=""
            width={56}
            height={56}
            className="rounded-xl border border-[var(--glass-border)]"
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-semibold">
              {builder.displayName}
            </h3>
            <p className="font-mono text-xs text-[var(--accent)]">@{builder.handle}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-[var(--ink-muted)]">
          {builder.tagline}
        </p>
        <p className="mt-2 text-xs font-medium text-[var(--accent-2)]">
          Signature: {builder.signatureProject}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {builder.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-md border border-[var(--glass-border)] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/builders/${builder.handle}`} className="btn-primary text-sm">
            Profile
          </Link>
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="btn-ghost text-sm"
          >
            Quick Connect
          </button>
          <a
            href={githubUrl(builder.handle)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-sm"
          >
            GitHub
          </a>
        </div>
      </article>
      <QuickConnectModal
        builder={builder}
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
      />
    </>
  );
}
