"use client";

import { useState } from "react";

const AGENDA = [
  {
    time: "10:00",
    title: "Welcome + cohort overview",
    detail: "Program director + Trailmark operator demo.",
  },
  {
    time: "10:30",
    title: "Portfolio gallery",
    detail: "Partners browse Trailmark; students at tables / virtual rooms.",
  },
  {
    time: "12:00",
    title: "Lunch",
    detail: "Informal conversations — no formal pitches.",
  },
  {
    time: "13:00",
    title: "Deep dives",
    detail: "Partners book 20-min sessions with up to 3 students each.",
  },
  {
    time: "14:30",
    title: "Lightning demos",
    detail: "90 seconds each — strongest artifact only.",
  },
  {
    time: "15:30",
    title: "Closing + intros",
    detail: "Placement lead explains next steps and routing.",
  },
];

export function ShowcaseAgenda() {
  const [active, setActive] = useState(1);

  return (
    <div id="agenda" className="showcase-agenda">
      <div className="agenda-rail" role="tablist" aria-label="Showcase agenda">
        {AGENDA.map((item, i) => (
          <button
            key={item.time}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`agenda-tick ${active === i ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
          >
            <span className="font-mono text-[0.7rem] text-[var(--signal)]">{item.time}</span>
            <span className="agenda-tick-title">{item.title}</span>
          </button>
        ))}
      </div>
      <div className="agenda-panel" role="tabpanel">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--signal)]">
          {AGENDA[active].time} ET · Aug 19
        </p>
        <p className="mt-2 font-display text-2xl tracking-tight">{AGENDA[active].title}</p>
        <p className="mt-3 text-[var(--fog)] leading-relaxed">{AGENDA[active].detail}</p>
        <div className="mt-5 flex gap-1.5">
          {AGENDA.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`step-dot ${active === i ? "is-active" : ""}`}
              aria-label={`Agenda block ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
