"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Builder } from "@/lib/types";
import { githubAvatar, githubUrl } from "@/lib/config";
import { QuickConnectModal } from "./QuickConnectModal";

const PREVIEW_GRADIENTS = [
  "from-indigo-600 via-violet-800 to-fuchsia-900",
  "from-emerald-700 via-teal-900 to-slate-900",
  "from-amber-600 via-orange-900 to-rose-950",
  "from-cyan-700 via-blue-900 to-indigo-950",
];

function previewGradient(handle: string): string {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) | 0;
  return PREVIEW_GRADIENTS[Math.abs(h) % PREVIEW_GRADIENTS.length]!;
}

type Props = {
  builder: Builder;
  open: boolean;
  onClose: () => void;
};

export function BuilderQuickPeek({ builder, open, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);

  const copyHandle = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`@${builder.handle}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [builder.handle]);

  if (!open) return null;

  return (
    <>
      <div
        className="quick-peek-backdrop"
        role="dialog"
        aria-modal
        aria-labelledby={`peek-${builder.handle}`}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div
          className="quick-peek-panel glass-card"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="quick-peek-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className={`quick-peek-preview bg-gradient-to-br ${previewGradient(builder.handle)}`}
          >
            <span className="quick-peek-preview-label">Signature project</span>
            <p className="quick-peek-preview-title">{builder.signatureProject}</p>
          </div>

          <div className="flex items-start gap-4 p-5">
            <Image
              src={githubAvatar(builder.handle)}
              alt=""
              width={64}
              height={64}
              className="rounded-xl border border-white/10 shadow-lg"
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <h2
                id={`peek-${builder.handle}`}
                className="font-display text-xl font-bold"
              >
                {builder.displayName}
              </h2>
              <button
                type="button"
                onClick={copyHandle}
                className="mt-1 flex items-center gap-2 font-mono text-sm text-[var(--accent)] hover:underline"
              >
                @{builder.handle}
                <span className="rounded border border-[var(--glass-border)] px-1.5 py-0.5 text-[10px] uppercase">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">{builder.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 px-5 pb-4">
            {builder.skills.map((s) => (
              <span key={s} className="skill-chip">
                {s}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[var(--glass-border)] p-5">
            <button
              type="button"
              onClick={() => {
                setConnectOpen(true);
              }}
              className="btn-primary text-sm"
            >
              Request intro
            </button>
            <Link
              href={`/builders/${builder.handle}`}
              className="btn-ghost text-sm"
              onClick={onClose}
            >
              Full profile
            </Link>
            <a
              href={githubUrl(builder.handle)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>

      <QuickConnectModal
        builder={builder}
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
      />
    </>
  );
}
