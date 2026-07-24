export default function TasksPage() {
  return (
    <section
      data-testid="tasks-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Tasks</h1>
      <p className="mt-3 text-[var(--color-secondary)] leading-relaxed">
        Visible Forth TicketLinks, filterable by status/assignee — Step 10.
      </p>
    </section>
  );
}
