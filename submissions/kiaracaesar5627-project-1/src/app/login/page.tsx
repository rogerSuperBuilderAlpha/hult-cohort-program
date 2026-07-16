"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { loginAction } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="hero-auth">
      <div className="auth-card">
        <p className="brand-sub">Welcome back</p>
        <h1>Sign in to Pilot</h1>
        <p className="lead">Track projects, assignments, and what to ship next.</p>
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
            <input name="email" type="email" required placeholder="you@school.edu" />
          </label>
          <label>
            Password
            <input name="password" type="password" required minLength={8} />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <SubmitButton>{pending ? "Signing in…" : "Sign in"}</SubmitButton>
        </form>
        <p className="muted" style={{ marginTop: "1rem" }}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
