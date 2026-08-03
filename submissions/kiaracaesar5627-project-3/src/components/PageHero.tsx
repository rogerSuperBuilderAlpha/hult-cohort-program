"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/** Shared interactive page header — glow follows the pointer. */
export function PageHero({
  kicker,
  title,
  lead,
  children,
}: {
  kicker: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  function onMove(e: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--px",
      `${((e.clientX - rect.left) / rect.width) * 100}%`,
    );
    el.style.setProperty(
      "--py",
      `${((e.clientY - rect.top) / rect.height) * 100}%`,
    );
  }

  return (
    <header ref={ref} className="page-hero" onPointerMove={onMove}>
      <div className="page-hero-glow" aria-hidden />
      <p className="section-kicker">
        <span className="live-dot" aria-hidden />
        {kicker}
      </p>
      <h1 className="page-hero-title font-display">{title}</h1>
      {lead ? <p className="section-lead !mb-0">{lead}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}
