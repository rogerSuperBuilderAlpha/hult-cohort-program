'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * Cohort momentum — one element, three lenses on the same week.
 *
 * The rails shape this completely: momentum here is COLLECTIVE, never a ranking. No number
 * counts who hasn't shipped, no bar belongs to a person. What's left to show is continuity
 * (the board hasn't gone quiet), generosity (people figured things out and passed them on),
 * and flow (the week's shape). The three lenses are those three reads:
 *   - current    — the week's shipping as a flowing current
 *   - generosity — help passed between people
 *   - streak     — the collective shipping streak, as an energy bar
 *
 * The narration lives in the brief above (one Pulse voice, not two); here each lens carries
 * only a short factual micro-label. It auto-rotates so it feels alive, pausing on hover/focus,
 * the toggle takes over and is remembered, and prefers-reduced-motion turns rotation AND the
 * decorative animation off. Green is shipping/continuity, sky is help — one accent at a time.
 */

export type MomentumData = {
  /** Ships per day across the last 7 days, oldest → today. Collective counts. */
  shipsByDay: number[];
  streakDays: number;
  figuredOut: number;
  unstuck: number;
  cohortShipped: number;
};

type Lens = 'current' | 'generosity' | 'streak';
const LENSES: Lens[] = ['current', 'generosity', 'streak'];
const ROTATE_MS = 6000;
const STORAGE_KEY = 'pulse:momentumLens';

/** A short, factual micro-label per lens — data, not a second Pulse voice. */
function microLabel(lens: Lens, d: MomentumData): string {
  if (lens === 'generosity') {
    const n = d.figuredOut + d.unstuck;
    return n > 0 ? `${n} handed on this week` : 'help travels here';
  }
  if (lens === 'streak') {
    return d.streakDays >= 2 ? `${d.streakDays} days unbroken` : 'kept current';
  }
  return d.cohortShipped > 0 ? `${d.cohortShipped} shipped this week` : 'this week so far';
}

function readSavedLens(): Lens | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && (LENSES as string[]).includes(saved) ? (saved as Lens) : null;
  } catch {
    return null;
  }
}

const STYLE = `
.mo-stage svg { display:block; width:100%; }
@media (prefers-reduced-motion: no-preference) {
  @keyframes mo-draw { from { stroke-dashoffset: 640; } to { stroke-dashoffset: 0; } }
  .mo-draw { stroke-dasharray: 640; animation: mo-draw 900ms cubic-bezier(.4,0,.2,1) both; }
  @keyframes mo-halo { 0%,100% { opacity:.18; r:9; } 50% { opacity:.4; r:12; } }
  .mo-halo { animation: mo-halo 2.4s ease-in-out infinite; }
  @keyframes mo-rise { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
  .mo-rise { animation: mo-rise 500ms ease-out both; }
  @keyframes mo-flow { to { stroke-dashoffset: -32; } }
  .mo-flow { stroke-dasharray: 3 6; animation: mo-flow 1.6s linear infinite; }
}
`;

export function Momentum({ data }: { data: MomentumData }) {
  const [lens, setLens] = useState<Lens>(() => readSavedLens() ?? 'current');
  const [pinned, setPinned] = useState<boolean>(() => readSavedLens() !== null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (pinned || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setLens((prev) => LENSES[(LENSES.indexOf(prev) + 1) % LENSES.length]);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [pinned, paused]);

  const choose = (next: Lens) => {
    setLens(next);
    setPinned(true);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* no storage — the choice still holds for this visit */
    }
  };

  return (
    <section
      className="mo-stage"
      aria-label="The cohort's momentum this week"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <style>{STYLE}</style>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium text-zinc-400">the cohort&rsquo;s momentum</span>
        <span className="flex-1" />
        <div className="inline-flex rounded-full bg-zinc-900 p-0.5" role="tablist" aria-label="Momentum view">
          {LENSES.map((l) => {
            const on = l === lens;
            const accent = l === 'generosity';
            return (
              <button
                key={l}
                role="tab"
                aria-selected={on}
                onClick={() => choose(l)}
                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                  on
                    ? accent
                      ? 'bg-sky-500/15 text-sky-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <div key={lens} className="mo-rise min-h-[112px]">
        {lens === 'current' && <CurrentLens data={data} />}
        {lens === 'generosity' && <GenerosityLens data={data} />}
        {lens === 'streak' && <StreakLens data={data} />}
      </div>

      <div className="mt-2 text-xs text-zinc-500">{microLabel(lens, data)}</div>
    </section>
  );
}

/** The week's shipping as a flowing current — gradient-filled area, a drawn line, and a
 *  breathing "today" node. */
function CurrentLens({ data }: { data: MomentumData }) {
  const W = 520;
  const H = 96;
  const { line, area, end } = useMemo(() => {
    const days = data.shipsByDay.length ? data.shipsByDay : [0];
    const max = Math.max(1, ...days);
    const stepX = days.length > 1 ? W / (days.length - 1) : 0;
    const pad = 14;
    const pts = days.map((v, i) => [i * stepX, H - pad - (v / max) * (H - pad * 2)] as const);
    // Smooth the polyline into a Catmull-Rom-ish path for a softer current.
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)},${y0.toFixed(1)} ${cx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return { line: d, area: `${d} L${W},${H} L0,${H} Z`, end: pts[pts.length - 1] };
  }, [data.shipsByDay]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The week's shipping as a rising current">
      <defs>
        <linearGradient id="mo-cur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(52 211 153)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="rgb(52 211 153)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#mo-cur)" />
      <path d={line} className="mo-draw" fill="none" stroke="rgb(52 211 153)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={end[0]} cy={end[1]} className="mo-halo" fill="rgb(52 211 153)" />
      <circle cx={end[0]} cy={end[1]} r={5} fill="rgb(52 211 153)" />
      <circle cx={end[0]} cy={end[1]} r={2} fill="rgb(6 78 59)" />
      <text x={6} y={H - 3} className="fill-zinc-600 text-[10px]">mon</text>
      <text x={W - 2} y={H - 3} textAnchor="end" className="fill-emerald-400/70 text-[10px]">today</text>
    </svg>
  );
}

/** Help passed between people — nodes joined by flowing arcs. Count-driven but capped, so it
 *  stays a shape, never a scoreboard. Sky = help. */
function GenerosityLens({ data }: { data: MomentumData }) {
  const W = 520;
  const H = 96;
  const moments = Math.min(6, Math.max(1, data.figuredOut + data.unstuck));
  const nodes = Math.min(6, moments + 1);
  const gap = W / (nodes + 1);
  const baseY = H - 26;
  const xs = Array.from({ length: nodes }, (_, i) => (i + 1) * gap);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Help passed between people this week">
      {xs.slice(0, -1).map((x, i) => {
        const x2 = xs[i + 1];
        const midX = (x + x2) / 2;
        const rise = baseY - Math.min(60, 30 + i * 8);
        return (
          <g key={i}>
            <path d={`M${x.toFixed(1)},${baseY} Q${midX.toFixed(1)},${rise.toFixed(1)} ${x2.toFixed(1)},${baseY}`} fill="none" stroke="rgb(56 189 248)" strokeWidth={2} opacity={0.35} />
            <path d={`M${x.toFixed(1)},${baseY} Q${midX.toFixed(1)},${rise.toFixed(1)} ${x2.toFixed(1)},${baseY}`} className="mo-flow" fill="none" stroke="rgb(125 211 252)" strokeWidth={2} strokeLinecap="round" />
          </g>
        );
      })}
      {xs.map((x, i) => (
        <g key={i}>
          {i % 2 === 0 && <circle cx={x.toFixed(1)} cy={baseY} className="mo-halo" fill="rgb(56 189 248)" />}
          <circle cx={x.toFixed(1)} cy={baseY} r={5.5} fill={i % 2 === 0 ? 'rgb(56 189 248)' : 'rgb(63 63 70)'} />
        </g>
      ))}
    </svg>
  );
}

/** The continuity streak as an energy bar — filled segments up to today, the leading edge
 *  glowing. Blames no one: fewer lit segments just means fewer days, never a mark against a
 *  person. */
function StreakLens({ data }: { data: MomentumData }) {
  const total = 7;
  const lit = Math.min(total, Math.max(0, data.streakDays));
  return (
    <div className="flex h-[96px] flex-col justify-center gap-3">
      <div className="flex items-end gap-2">
        {Array.from({ length: total }, (_, i) => {
          const active = i < lit;
          const leading = i === lit - 1;
          const height = 20 + (i / (total - 1)) * 28;
          return (
            <div
              key={i}
              className={`flex-1 rounded-md transition-colors ${active ? 'bg-emerald-400' : 'bg-zinc-800'} ${leading ? 'ring-4 ring-emerald-400/20' : ''}`}
              style={{ height: active ? height : 20, opacity: active ? 0.55 + (i / (total - 1)) * 0.45 : 1 }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">last 7 days</span>
        <span className="text-[11px] font-medium text-emerald-400">today</span>
      </div>
    </div>
  );
}
