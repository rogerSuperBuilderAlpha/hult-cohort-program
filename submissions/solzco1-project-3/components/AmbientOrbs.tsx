"use client";

export function AmbientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="ambient-orb ambient-orb-indigo" />
      <div className="ambient-orb ambient-orb-emerald" />
      <div className="ambient-orb ambient-orb-violet" />
    </div>
  );
}
