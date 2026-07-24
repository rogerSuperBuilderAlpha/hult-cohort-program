export default async function ChannelPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <section
      data-testid="channel-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <p className="text-sm font-medium text-[var(--color-primary)]">Channel</p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--color-dark)]">
        #{slug}
      </h1>
      <p className="mt-3 text-[var(--color-secondary)] leading-relaxed">
        Realtime message list and composer arrive in Step 4.
      </p>
    </section>
  );
}
