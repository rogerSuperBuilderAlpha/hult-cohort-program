import Link from "next/link";
import { searchMessages } from "@/app/(app)/search/actions";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; channel?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const channelId = params.channel || null;

  let hits: Awaited<ReturnType<typeof searchMessages>> = [];
  let error: string | null = null;
  if (q.length >= 2) {
    try {
      hits = await searchMessages({ q, channelId });
    } catch (e) {
      error = e instanceof Error ? e.message : "Search failed";
    }
  }

  return (
    <section
      data-testid="search-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Search</h1>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        Keyword search across channels you can see (Postgres FTS when available).
      </p>

      <form className="mt-5 flex gap-2" action="/search" method="get">
        <input
          name="q"
          defaultValue={q}
          data-testid="search-page-input"
          placeholder="Search messages…"
          className="min-w-0 flex-1 rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-2 text-sm"
        />
        {channelId ? <input type="hidden" name="channel" value={channelId} /> : null}
        <button
          type="submit"
          data-testid="search-page-submit"
          className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>
      ) : null}

      <ul data-testid="search-results" className="mt-6 space-y-2">
        {q.length < 2 ? (
          <li className="text-sm text-[var(--color-secondary)]">
            Enter at least 2 characters.
          </li>
        ) : hits.length === 0 ? (
          <li className="text-sm text-[var(--color-secondary)]">No matches for “{q}”.</li>
        ) : (
          hits.map((hit) => (
            <li key={hit.id}>
              <Link
                href={hit.href}
                data-testid="search-hit"
                className="block rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] px-4 py-3 hover:border-[var(--color-primary)]"
              >
                <p className="text-xs text-[var(--color-secondary)]">
                  {hit.channel_slug
                    ? `#${hit.channel_slug}`
                    : "Direct message"}{" "}
                  · {hit.author_name || "Member"} ·{" "}
                  {new Date(hit.created_at).toLocaleString()}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--color-dark)]">
                  {hit.body_richtext.replace(/<!--conexusticket:[0-9a-f-]+-->/gi, "").trim()}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
