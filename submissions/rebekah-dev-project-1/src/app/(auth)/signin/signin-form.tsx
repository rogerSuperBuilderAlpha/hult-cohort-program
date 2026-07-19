"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithCredentials, type FormState } from "@/lib/actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400";

export function SignInForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    signInWithCredentials,
    {},
  );
  const registered = useSearchParams().get("registered");

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {registered && (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Account created — sign in to get started.
        </p>
      )}
      {state.error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {state.error}
        </p>
      )}
      <label className="block text-sm text-slate-300">
        Email
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="block text-sm text-slate-300">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-400">
        No account yet?{" "}
        <Link href="/signup" className="text-indigo-300 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
