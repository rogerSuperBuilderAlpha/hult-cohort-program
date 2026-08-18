"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { SITE } from "@/lib/site";

/** Atmospheric trail — decorative only (no game interactions). */
const NODES = [
  { x: 16, y: 30 },
  { x: 38, y: 18 },
  { x: 62, y: 34 },
  { x: 82, y: 16 },
  { x: 52, y: 50 },
];

export function HeroInteractive() {
  const planeRef = useRef<HTMLElement>(null);

  function onMove(e: PointerEvent<HTMLElement>) {
    const el = planeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    el.style.setProperty("--tx", `${(x - 50) / 22}px`);
    el.style.setProperty("--ty", `${(y - 50) / 28}px`);
  }

  return (
    <section
      ref={planeRef}
      className="hero-plane hero-interactive"
      onPointerMove={onMove}
    >
      <div className="hero-glow" aria-hidden />
      <div className="hero-constellation" aria-hidden>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="hero-lines">
          <path
            className="hero-path"
            d="M16 30 C28 22, 32 20, 38 18 S56 30, 62 34 74 20, 82 16"
            fill="none"
          />
          <path
            className="hero-path hero-path-2"
            d="M16 30 C32 42, 44 46, 52 50 S70 40, 82 16"
            fill="none"
          />
        </svg>
        {NODES.map((node, i) => (
          <span
            key={i}
            className="hero-node hero-node-static"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <span className="hero-node-core" />
          </span>
        ))}
      </div>

      <div className="hero-content">
        <p className="reveal section-kicker">
          <span className="live-dot" aria-hidden />
          {SITE.cohort} · {SITE.term}
        </p>
        <h1 className="reveal reveal-delay-1 hero-title font-display">
          <span className="hero-title-word">
            {SITE.name.split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className="hero-letter"
                style={{ animationDelay: `${0.08 + i * 0.05}s` }}
              >
                {ch}
              </span>
            ))}
          </span>
        </h1>
        <p className="reveal reveal-delay-2 hero-tagline">{SITE.tagline}</p>
        <div className="reveal reveal-delay-3 mt-9 flex flex-wrap gap-3">
          <Link href="/people" className="btn btn-primary btn-bounce">
            Meet the builders
          </Link>
          <Link href="/partners" className="btn btn-ghost">
            For hiring partners
          </Link>
        </div>
      </div>
    </section>
  );
}
