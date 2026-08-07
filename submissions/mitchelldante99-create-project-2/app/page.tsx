"use client";

import { useEffect, useState } from "react";

interface Tip {
  id: string;
  title: string;
  body: string;
}

export default function Home() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [viewedTipIds, setViewedTipIds] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tips")
      .then((r) => r.json())
      .then((data) => {
        setTips(data.tips);
        setViewedTipIds(data.viewedTipIds);
        setSignedIn(data.signedIn);
      })
      .finally(() => setLoading(false));
  }, []);

  async function markViewed(tipId: string) {
    if (!signedIn || viewedTipIds.includes(tipId)) return;
    setMarking(tipId);
    const res = await fetch("/api/tips/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipId }),
    });
    if (res.ok) {
      setViewedTipIds((prev) => [...prev, tipId]);
    }
    setMarking(null);
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <header className="mb-12 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400">
              Ascended Learning
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-50">
              Study &amp; revision techniques
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              Short, evidence-based tips for learning things that stick.
            </p>
          </div>

          {signedIn ? (
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="whitespace-nowrap rounded-md border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-900"
              >
                Sign out
              </button>
            </form>
          ) : (
            <a
              href="/api/auth/login"
              className="whitespace-nowrap rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-stone-950 hover:bg-amber-400"
            >
              Sign in with Ludwitt
            </a>
          )}
        </header>

        {!signedIn && !loading && (
          <div className="mb-8 rounded-md border border-stone-800 bg-stone-900/50 px-4 py-3 text-sm text-stone-400">
            Sign in to track which tips you&apos;ve gone through.
          </div>
        )}

        {loading ? (
          <p className="text-sm text-stone-500">Loading tips…</p>
        ) : (
          <ul className="space-y-3">
            {tips.map((tip) => {
              const viewed = viewedTipIds.includes(tip.id);
              return (
                <li
                  key={tip.id}
                  className="rounded-lg border border-stone-800 bg-stone-900/40 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-base font-medium text-stone-50">{tip.title}</h2>
                    {signedIn && (
                      <button
                        onClick={() => markViewed(tip.id)}
                        disabled={viewed || marking === tip.id}
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                          viewed
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                        }`}
                      >
                        {viewed ? "Viewed" : marking === tip.id ? "Marking…" : "Mark as viewed"}
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">{tip.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
