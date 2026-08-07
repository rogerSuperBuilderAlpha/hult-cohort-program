"use client";

import { useFormState } from "react-dom";
import { signIn, signUp } from "@/app/actions";

type AuthState = { error?: string } | undefined;

function AuthForm({
  action,
  submitLabel,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {submitLabel === "Create account" && (
        <label className="block">
          <span className="text-sm font-medium">Display name</span>
          <input
            name="display_name"
            className="mt-1 w-full rounded border border-moss/30 bg-paper px-3 py-2"
            autoComplete="name"
          />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border border-moss/30 bg-paper px-3 py-2"
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full rounded border border-moss/30 bg-paper px-3 py-2"
          autoComplete={submitLabel === "Create account" ? "new-password" : "current-password"}
        />
      </label>
      {state?.error && (
        <p className="text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        className="w-full min-h-[44px] rounded bg-moss px-4 py-2 text-paper hover:bg-ink"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <header className="mb-8 border-b border-moss/20 pb-6">
        <p className="text-xs uppercase tracking-widest text-moss">Cohort field journal</p>
        <h1 className="font-serif text-3xl text-ink">Sign in to Comms</h1>
        <p className="mt-2 text-sm text-ink/80">
          Use the same email and password as your Forth PM workspace at{" "}
          <a href="https://forth-bice.vercel.app/">forth-bice.vercel.app</a>.
        </p>
      </header>

      <section className="rounded-lg border border-moss/25 bg-paper-dark/40 p-6">
        <h2 className="mb-4 font-serif text-xl">Sign in</h2>
        <AuthForm action={signIn} submitLabel="Sign in" />
      </section>

      <section className="mt-8 rounded-lg border border-moss/25 bg-paper-dark/40 p-6">
        <h2 className="mb-4 font-serif text-xl">New here?</h2>
        <AuthForm action={signUp} submitLabel="Create account" />
      </section>
    </main>
  );
}
