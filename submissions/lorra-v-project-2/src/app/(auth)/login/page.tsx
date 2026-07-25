import {
  signInWithDevPassword,
  signInWithGitHub,
  signInWithGoogle,
  signInWithMagicLink,
} from "./actions";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

const ERROR_COPY: Record<string, string> = {
  deactivated: "This account has been deactivated. Contact an admin.",
  missing_email: "Your sign-in provider did not return an email.",
  missing_code: "Sign-in link was incomplete. Try again.",
  invalid_credentials: "Email or password is incorrect.",
  dev_login_disabled: "Local demo login is disabled.",
  google_failed: "Google sign-in failed. Try GitHub or the magic link fallback.",
  github_failed: "GitHub sign-in failed. Try Google or the magic link fallback.",
};

function friendlyError(code: string | undefined) {
  if (!code) return null;
  return ERROR_COPY[code] || decodeURIComponent(code);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = friendlyError(
    typeof params.error === "string" ? params.error : undefined,
  );
  const sent = params.sent === "1";
  const emailHint = typeof params.email === "string" ? params.email : "";
  const next = safeRedirectPath(
    typeof params.next === "string" ? params.next : "/",
  );
  // Never show seed login on production builds (Vercel), even if env is mis-set.
  const enableDevLogin =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";
  const devEmail = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";

  return (
    <main
      data-testid="login-page"
      className="flex min-h-full items-center justify-center bg-[var(--color-bg)] px-4 py-12"
    >
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-surface)] p-8 shadow-[0_1px_2px_rgba(22,50,79,0.06)]">
        <div className="mb-8 flex items-center gap-3">
          <div
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] text-sm font-bold text-white"
          >
            C
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-dark)]">Conexus</h1>
            <p className="text-sm text-[var(--color-secondary)]">
              From Conversation to Coordination
            </p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-[var(--color-secondary)]">
          Sign in with Google or GitHub to join the cohort workspace. New accounts
          start as members — no invite required.
        </p>

        {error ? (
          <p
            data-testid="login-error"
            className="mb-4 rounded-[var(--radius-button)] bg-[color-mix(in_srgb,var(--color-danger)_12%,white)] px-3 py-2 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {sent ? (
          <p
            data-testid="magic-link-sent"
            className="mb-4 rounded-[var(--radius-button)] bg-[color-mix(in_srgb,var(--color-primary)_12%,white)] px-3 py-2 text-sm text-[var(--color-dark)]"
          >
            Magic link sent{emailHint ? ` to ${emailHint}` : ""}. Check your inbox.
          </p>
        ) : null}

        <div className="space-y-3">
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              data-testid="google-signin"
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Continue with Google
              <span aria-hidden>→</span>
            </button>
          </form>

          <form action={signInWithGitHub}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              data-testid="github-signin"
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-dark)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Continue with GitHub
              <span aria-hidden>→</span>
            </button>
          </form>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-[var(--color-secondary)]">
          <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)]" />
          Fallback
          <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)]" />
        </div>

        <form action={signInWithMagicLink} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm font-medium text-[var(--color-dark)]" htmlFor="magic-email">
            Email magic link
          </label>
          <input
            id="magic-email"
            name="email"
            type="email"
            required
            placeholder="you@school.edu"
            data-testid="magic-email"
            className="w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-dark)] outline-none focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            data-testid="magic-link-submit"
            className="w-full rounded-[var(--radius-button)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)]"
          >
            Send magic link
          </button>
        </form>

        {enableDevLogin ? (
          <div className="mt-8 border-t border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
              Local demo login
            </p>
            <p className="mb-3 text-xs text-[var(--color-secondary)]">
              Seeded cohort accounts (no Google/GitHub required). Default admin:{" "}
              {devEmail}
            </p>
            <form action={signInWithDevPassword} className="space-y-3">
              <input type="hidden" name="next" value={next} />
              <input
                name="email"
                type="email"
                required
                defaultValue={devEmail}
                data-testid="dev-email"
                className="w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Seed password"
                data-testid="dev-password"
                className="w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <button
                type="submit"
                data-testid="dev-login-submit"
                className="w-full rounded-[var(--radius-button)] bg-[var(--color-dark)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Sign in with seed account
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </main>
  );
}
