import type { GateCheck } from "@/lib/types";

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-soft)]">
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function GateList({ gates }: { gates: GateCheck[] }) {
  return (
    <ul className="space-y-3">
      {gates.map((gate) => (
        <li
          key={gate.key}
          className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3 last:border-0"
        >
          <div>
            <p className="font-medium">{gate.label}</p>
            <p className="text-sm text-[var(--muted)]">
              {gate.current} · target {gate.target}
            </p>
          </div>
          <span
            className={`text-sm font-semibold ${gate.met ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
          >
            {gate.met ? "Met" : "Open"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--accent)]";

export const buttonClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-[#1a1406] transition hover:bg-[var(--accent-dim)] disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-transparent px-4 py-2 font-medium text-[var(--ink)] hover:bg-[var(--bg-soft)]";
