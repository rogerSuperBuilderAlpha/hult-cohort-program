"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    signupAction,
    null,
  );

  if (state?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>{state.success}</CardDescription>
        </CardHeader>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition hover:brightness-110"
        >
          Go to log in
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Comentiq</CardTitle>
        <CardDescription>
          Create your builder account for the Hult Summer Cohort.
        </CardDescription>
      </CardHeader>

      <form action={action} className="space-y-4">
        <Input
          label="Name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          required
          disabled={pending}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={pending}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          required
          minLength={6}
          disabled={pending}
          hint="You’ll use this to sign in — no social login this sprint."
        />

        {state?.error ? (
          <p
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Spinner size="sm" showLabel={false} label="Creating account" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
