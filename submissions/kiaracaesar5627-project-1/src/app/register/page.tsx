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
        <p className="brand-sub">Get started</p>
        <h1>Join FlexiFlow</h1>
        <p className="lead">
          Create an account with email + password, then spin up your first
          customizable workspace.
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
            <input
              name="name"
              required
              maxLength={80}
              placeholder="Ada Lovelace"
              autoComplete="name"
            />
          </label>
          <label>
            Username
            <input
              name="username"
              required
              maxLength={32}
              placeholder="ada"
              pattern="[a-zA-Z0-9_-]+"
              autoComplete="username"
              aria-describedby="username-hint"
            />
            <span id="username-hint" className="muted">
              Letters, numbers, dashes and underscores only.
            </span>
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="ada@hult.edu"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              aria-describedby="password-hint"
            />
            <span id="password-hint" className="muted">
              At least 8 characters.
            </span>
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
