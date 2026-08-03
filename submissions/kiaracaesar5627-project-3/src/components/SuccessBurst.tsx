"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const BURSTS = ["✦", "◆", "●", "▲", "◇"];

export function SuccessBurst({ message }: { message: string }) {
  const [bits, setBits] = useState<{ id: number; x: number; char: string }[]>(
    [],
  );

  useEffect(() => {
    const next = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      char: BURSTS[i % BURSTS.length],
    }));
    setBits(next);
  }, [message]);

  return (
    <div className="success-burst" role="status">
      <p className="success-burst-msg">{message}</p>
      <div className="success-burst-bits" aria-hidden>
        {bits.map((b) => (
          <span
            key={b.id}
            className="success-bit"
            style={{ left: `${b.x}%`, animationDelay: `${b.id * 40}ms` }}
          >
            {b.char}
          </span>
        ))}
      </div>
      <p className="mt-2 font-mono text-[0.65rem] text-[var(--fog)]/70">
        {SITE.name} · placement queue
      </p>
    </div>
  );
}
