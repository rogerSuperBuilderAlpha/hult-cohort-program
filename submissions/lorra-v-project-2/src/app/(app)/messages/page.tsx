function PlaceholderPage({
  title,
  testId,
  blurb,
}: {
  title: string;
  testId: string;
  blurb: string;
}) {
  return (
    <section
      data-testid={testId}
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">{title}</h1>
      <p className="mt-3 text-[var(--color-secondary)] leading-relaxed">{blurb}</p>
    </section>
  );
}

export default function MessagesPage() {
  return (
    <PlaceholderPage
      title="Messages"
      testId="messages-page"
      blurb="DM list and conversation view arrive in Step 5. Composer and realtime messaging share components with channels."
    />
  );
}
