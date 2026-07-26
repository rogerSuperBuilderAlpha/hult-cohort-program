"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { registerAction } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <main className="hero-auth">
      <div className="auth-card">
        <p className="muted">Join the cohort chat</p>
        <h1>Create your Huddle account</h1>
        <p className="lead">
          Prefer the same email as FlexiFlow so staff can match accounts across
          platforms.
        </p>
        <form
          className="form"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const result = await registerAction(fd);
              if (result && !result.ok) setError(result.error);
            });
          }}
        >
          <label>
            Name
            <input name="name" required maxLength={80} autoComplete="name" />
          </label>
          <label>
            Username
            <input
              name="username"
              required
              maxLength={32}
              pattern="[a-zA-Z0-9_-]+"
              autoComplete="username"
            />
          </label>
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
              autoComplete="new-password"
            />
          </label>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          <SubmitButton>{pending ? "Creating…" : "Create account"}</SubmitButton>
        </form>
        <p className="muted" style={{ marginTop: "1rem" }}>
          Already enrolled? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
