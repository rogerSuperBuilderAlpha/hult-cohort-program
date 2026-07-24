export default function HomePage() {
  return (
    <section
      data-testid="home-digest"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[0_1px_2px_rgba(22,50,79,0.04)] md:p-8"
    >
      <p className="text-sm font-medium text-[var(--color-primary)]">Home</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-dark)]">
        Activity digest
      </h1>
      <p className="mt-3 max-w-xl text-[var(--color-secondary)] leading-relaxed">
        Unread channels, recent mentions, and your Forth tickets will land here
        in a later step. This shell confirms navigation and Conexus design
        tokens (PRD §5 / §8).
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Unread channels", value: "—" },
          { label: "Mentions", value: "—" },
          { label: "Forth tickets", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] bg-[var(--color-bg)] px-4 py-3"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-secondary)]">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-[var(--color-dark)]">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
