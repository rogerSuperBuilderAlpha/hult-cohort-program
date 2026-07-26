import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  github_unavailable: "GitHub sign-in is not configured on this server.",
  github_denied: "GitHub sign-in was cancelled.",
  github_invalid: "GitHub sign-in returned an invalid response.",
  github_state: "GitHub sign-in failed a security check. Try again.",
  github_failed: "Could not complete GitHub sign-in. Try again.",
};

export function GitHubAuthButton({
  enabled,
  errorCode,
}: {
  enabled: boolean;
  errorCode?: string | null;
}) {
  const message =
    errorCode && ERROR_MESSAGES[errorCode]
      ? ERROR_MESSAGES[errorCode]
      : errorCode
        ? "Sign-in failed. Try again."
        : null;

  return (
    <div className="github-auth">
      {enabled ? (
        <Link href="/api/auth/github" className="btn github-btn">
          <GithubMark />
          Continue with GitHub
        </Link>
      ) : (
        <p className="muted github-auth-note">
          GitHub sign-in is unavailable until{" "}
          <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code>{" "}
          are set.
        </p>
      )}
      {message ? (
        <p className="error" role="alert">
          {message}
        </p>
      ) : null}
      <div className="auth-divider" aria-hidden="true">
        <span>or</span>
      </div>
    </div>
  );
}

function GithubMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}
