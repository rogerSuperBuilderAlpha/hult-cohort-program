"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

type ProviderId = "google" | "github";

function providerLabel(p: string) {
  if (p === "google") return "Google";
  if (p === "github") return "GitHub";
  return p;
}

export function LinkedAccountsPanel() {
  const [providers, setProviders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUserIdentities().then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
        setLoaded(true);
        return;
      }
      setProviders((data?.identities ?? []).map((i) => i.provider));
      setLoaded(true);
    });
  }, []);

  function link(provider: ProviderId) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const supabase = createClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { data, error: err } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${appUrl}/settings?linked=1`,
        },
      });
      if (err) {
        const msg = err.message || "Link failed";
        // Manual linking is off by default in Supabase Auth settings.
        if (/manual.?link|linking.?not.?enabled|disabled/i.test(msg)) {
          setError(
            "Manual identity linking is disabled on this Supabase project. Enable Authentication → Providers (or Auth settings) → Allow manual linking, then try again.",
          );
        } else {
          setError(msg);
        }
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setInfo(`${providerLabel(provider)} linked.`);
      const refreshed = await supabase.auth.getUserIdentities();
      setProviders((refreshed.data?.identities ?? []).map((i) => i.provider));
    });
  }

  const hasGoogle = providers.includes("google");
  const hasGitHub = providers.includes("github");

  return (
    <section
      data-testid="linked-accounts"
      className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6"
    >
      <h2 className="text-lg font-semibold text-[var(--color-dark)]">
        Linked sign-in methods
      </h2>
      <p className="mt-1 text-sm text-[var(--color-secondary)]">
        Connect Google and GitHub to the same account so you can use either at login.
        Requires Supabase “Allow manual linking”.
      </p>

      {!loaded ? (
        <p className="mt-4 text-sm text-[var(--color-secondary)]">Loading…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          <li className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--color-dark)]">
              Google{" "}
              {hasGoogle ? (
                <span className="text-[var(--color-secondary)]">(linked)</span>
              ) : null}
            </span>
            {hasGoogle ? null : (
              <button
                type="button"
                data-testid="link-google"
                disabled={pending}
                onClick={() => link("google")}
                className="rounded-[var(--radius-button)] border border-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] disabled:opacity-60"
              >
                Link Google account
              </button>
            )}
          </li>
          <li className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--color-dark)]">
              GitHub{" "}
              {hasGitHub ? (
                <span className="text-[var(--color-secondary)]">(linked)</span>
              ) : null}
            </span>
            {hasGitHub ? null : (
              <button
                type="button"
                data-testid="link-github"
                disabled={pending}
                onClick={() => link("github")}
                className="rounded-[var(--radius-button)] border border-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] disabled:opacity-60"
              >
                Link GitHub account
              </button>
            )}
          </li>
        </ul>
      )}

      {error ? (
        <p
          data-testid="link-accounts-error"
          className="mt-4 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="mt-4 text-sm text-[var(--color-primary)]">{info}</p>
      ) : null}
    </section>
  );
}
