const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim();

export function CalendlyEmbed() {
  if (!CALENDLY_URL) {
    return (
      <p className="mt-4 text-sm text-ceal-muted">
        Calendly embed not configured on this deploy. Use the partner inquiry form above or email via
        the GitHub issue flow.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-ceal-line">
      <iframe
        title="Book a cohort briefing"
        src={CALENDLY_URL}
        className="h-[520px] w-full border-0"
        loading="lazy"
      />
    </div>
  );
}
