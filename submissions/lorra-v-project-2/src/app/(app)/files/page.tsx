export default function FilesPage() {
  return (
    <section
      data-testid="files-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Files</h1>
      <p className="mt-3 text-[var(--color-secondary)] leading-relaxed">
        Attachments you can see, filterable by channel — Step 10.
      </p>
    </section>
  );
}
