"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type FormState } from "@/lib/actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(signUpAction, {});

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state.error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {state.error}
        </p>
      )}
      <label className="block text-sm text-slate-300">
        Name
        <input name="name" type="text" required autoComplete="name" className={inputClass} />
      </label>
      <label className="block text-sm text-slate-300">
        Email
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="block text-sm text-slate-300">
        Password (8+ characters)
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link href="/signin" className="text-indigo-300 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
