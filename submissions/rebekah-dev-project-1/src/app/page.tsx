import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await currentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300">
        Hult Cohort Developer Program · Summer 2026
      </p>
      <h1 className="text-5xl font-bold tracking-tight text-white">Momentum</h1>
      <p className="mt-4 max-w-xl text-lg text-slate-400">
        The cohort&apos;s project management platform. Track work, hit deadlines,
        and keep the shipping streak alive — together.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
        >
          Create account
        </Link>
        <Link
          href="/signin"
          className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500"
        >
          Sign in
        </Link>
      </div>
      <div className="mt-16 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
        {[
          ["🎯", "Clear next actions", "Always know the one thing to do next — ranked by priority and deadline."],
          ["🔥", "Shipping streaks", "Complete something every day and watch your streak grow."],
          ["🚢", "Cohort ship feed", "See what everyone just shipped. Momentum is contagious."],
        ].map(([icon, title, body]) => (
          <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-2xl">{icon}</div>
            <h3 className="mt-2 font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
