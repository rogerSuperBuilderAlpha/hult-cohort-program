import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { Field, buttonClass, inputClass } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pt-10">
      <div>
        <p className="font-[family-name:var(--font-display)] text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
          Mission Control
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          Sign in
        </h1>
        <p className="mt-2 text-[var(--muted)]">Email and password for your cohort account.</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <form action={signIn} className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5">
        <Field label="Email">
          <input className={inputClass} type="email" name="email" required autoComplete="email" />
        </Field>
        <Field label="Password">
          <input
            className={inputClass}
            type="password"
            name="password"
            required
            autoComplete="current-password"
            minLength={6}
          />
        </Field>
        <button className={buttonClass} type="submit">
          Sign in
        </button>
      </form>

      <p className="text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/signup" className="text-[var(--accent)] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
