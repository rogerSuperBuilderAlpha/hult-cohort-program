"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { loginAction } from "@/lib/actions";
import { GitHubAuthButton } from "@/components/GitHubAuthButton";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginClient({
  githubEnabled,
  githubError,
}: {
  githubEnabled: boolean;
  githubError?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <main className="hero-auth">
      <div className="auth-card">
        <p className="muted">Welcome back</p>
        <h1>Sign in to Huddle</h1>
        <p className="lead">Use the same email you registered on FlexiFlow when possible.</p>
        <GitHubAuthButton enabled={githubEnabled} errorCode={githubError} />
        <form
          className="form"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const result = await loginAction(fd);
              if (result && !result.ok) setError(result.error);
            });
          }}
        >
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
            />
          </label>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          <SubmitButton>{pending ? "Signing in…" : "Sign in"}</SubmitButton>
        </form>
        <p className="muted" style={{ marginTop: "1rem" }}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
