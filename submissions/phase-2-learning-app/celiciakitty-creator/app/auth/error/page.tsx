import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";

const MESSAGES: Record<string, { title: string; body: string }> = {
  denied: {
    title: "Sign-in cancelled",
    body: "You chose not to authorise LexLearn with Ludwitt. You can try again whenever you are ready.",
  },
  state_mismatch: {
    title: "Security check failed",
    body: "The sign-in request could not be verified. Please start again from the Sign in with Ludwitt button.",
  },
  session_expired: {
    title: "Sign-in session expired",
    body: "Your Ludwitt sign-in session timed out. Please try again.",
  },
  missing_params: {
    title: "Incomplete sign-in response",
    body: "Ludwitt did not return the expected authorisation data. Please try again.",
  },
  token_exchange: {
    title: "Could not complete sign-in",
    body: "LexLearn could not exchange the authorisation code with Ludwitt. The code may have expired or already been used.",
  },
  userinfo: {
    title: "Could not load your profile",
    body: "Sign-in succeeded but your Ludwitt profile could not be retrieved. Please try again later.",
  },
  config: {
    title: "Sign-in not configured",
    body: "Ludwitt OAuth environment variables are missing on this server. Contact the site administrator.",
  },
  login_start: {
    title: "Could not start sign-in",
    body: "LexLearn could not begin the Ludwitt OAuth flow. Please try again later.",
  },
  oauth: {
    title: "Sign-in error",
    body: "Ludwitt reported an error during authorisation. Please try again.",
  },
  unavailable: {
    title: "Ludwitt unavailable",
    body: "The Ludwitt service could not be reached. Please try again later.",
  },
};

type PageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reason = params.reason ?? "oauth";
  const message = MESSAGES[reason] ?? MESSAGES.oauth;

  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lex-gold">
          Ludwitt sign-in
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-lex-navy">
          {message.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-lex-navy/75">
          {message.body}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-lex-navy px-6 text-sm font-medium text-white hover:bg-lex-navy/90"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-lex-navy/20 bg-white px-6 text-sm font-medium text-lex-navy hover:bg-lex-pale"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
