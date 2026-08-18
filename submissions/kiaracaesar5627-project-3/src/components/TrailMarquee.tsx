const ITEMS = [
  "inspect the trail",
  "peer-reviewed builds",
  "live deploys",
  "public GitHub",
  "hire from evidence",
  "pay on hire",
  "Summer Pilot 2026",
  "Boston × hybrid",
  "no résumé theater",
  "ten-minute shortlist",
  "request an intro",
  "Aug 19 showcase",
];

export function TrailMarquee() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-item">
            <span className="marquee-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
