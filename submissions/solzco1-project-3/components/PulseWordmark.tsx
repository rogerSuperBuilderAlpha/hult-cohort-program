import { COHORT } from "@/lib/config";

export function PulseWordmark({ size = "lg" }: { size?: "sm" | "lg" }) {
  const text = size === "lg" ? "text-5xl sm:text-6xl" : "text-xl";
  return (
    <span className={`inline-flex items-center gap-2 ${text}`}>
      <span className="pulse-icon h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden />
      <span className="pulse-wordmark">PULSE</span>
    </span>
  );
}

export function PulseTagline() {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent-2)]">
      {COHORT.name} · {COHORT.term}
    </p>
  );
}
