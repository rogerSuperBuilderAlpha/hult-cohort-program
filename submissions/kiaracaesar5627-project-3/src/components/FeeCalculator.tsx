"use client";

import { useMemo, useState } from "react";

export function FeeCalculator() {
  const [salary, setSalary] = useState(160_000);
  const fee = useMemo(() => Math.round(salary * 0.25), [salary]);
  const kickback = useMemo(() => Math.round(fee * 0.1), [fee]);

  return (
    <div id="fee-math" className="fee-calc">
      <div className="fee-calc-slider">
        <div className="flex items-end justify-between gap-3">
          <label htmlFor="salary" className="font-mono text-xs uppercase tracking-wider text-[var(--fog)]">
            First-year base
          </label>
          <p className="font-display text-2xl tabular-nums">
            ${salary.toLocaleString()}
          </p>
        </div>
        <input
          id="salary"
          type="range"
          min={90000}
          max={280000}
          step={5000}
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
          className="fee-range"
        />
        <div className="flex justify-between font-mono text-[0.65rem] text-[var(--fog)]/70">
          <span>$90k</span>
          <span>$280k</span>
        </div>
      </div>
      <div className="fee-calc-results">
        <button
          type="button"
          className="fee-result"
          onClick={() => setSalary(120_000)}
        >
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--signal)]">
            Referral fee · 25%
          </span>
          <span className="font-display text-3xl tabular-nums">${fee.toLocaleString()}</span>
          <span className="text-xs text-[var(--fog)]">Tap to preset $120k</span>
        </button>
        <button
          type="button"
          className="fee-result"
          onClick={() => setSalary(200_000)}
        >
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--signal)]">
            Grad kickback · 10%
          </span>
          <span className="font-display text-3xl tabular-nums">${kickback.toLocaleString()}</span>
          <span className="text-xs text-[var(--fog)]">Tap to preset $200k</span>
        </button>
      </div>
    </div>
  );
}
