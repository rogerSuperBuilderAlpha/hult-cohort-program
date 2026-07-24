export default function ThreadsPage() {
  return (
    <section
      data-testid="threads-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Threads</h1>
      <p className="mt-3 text-[var(--color-secondary)] leading-relaxed">
        Subscribed threads by latest activity (PRD §4.3 / §5) — built in Step 6.
      </p>
    </section>
  );
}
