import {
  JOURNEY_CURRENT_INDEX,
  JOURNEY_STEPS,
} from "@/lib/activity";

export function JourneyTimeline() {
  return (
    <ol className="flex flex-col gap-0 border border-[var(--line)] bg-[var(--bg-elevated)] sm:flex-row sm:items-stretch">
      {JOURNEY_STEPS.map((step, index) => {
        const current = index === JOURNEY_CURRENT_INDEX;
        const done = index < JOURNEY_CURRENT_INDEX;
        return (
          <li
            key={step.id}
            className={`flex flex-1 flex-col justify-center border-b border-[var(--line)] px-3 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
              current ? "bg-[var(--signal-soft)]" : ""
            }`}
          >
            <span
              className={`font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold uppercase tracking-[0.12em] ${
                current
                  ? "text-[var(--signal)]"
                  : done
                    ? "text-[var(--ok)]"
                    : "text-[var(--ink-faint)]"
              }`}
            >
              {done ? "Done" : current ? "Now" : "Next"}
            </span>
            <span className="mt-1 font-[family-name:var(--font-syne)] text-sm font-semibold text-[var(--ink)]">
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
