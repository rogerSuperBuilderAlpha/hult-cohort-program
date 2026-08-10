"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  authenticated: boolean;
  user?: {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  balance?: {
    spendableCents: number;
    spendableFormatted: string;
    balanceCents: number;
    balanceFormatted: string;
  } | null;
  topUpUrl?: string;
  error?: string;
};

export function LudwittAuthBar({ authError }: { authError?: string | null }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ludwitt/me", { cache: "no-store" });
        const data = (await res.json()) as MeResponse;
        if (!cancelled) setMe(data);
      } catch {
        if (!cancelled) setMe({ authenticated: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const spendable = me?.balance?.spendableCents ?? null;

  return (
    <div className="w-full max-w-2xl mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/70 border border-gray-800 rounded-2xl px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-amber-300/90 font-bold">
            Ludwitt Credits
          </p>
          {loading ? (
            <p className="text-xs text-gray-400">Checking session…</p>
          ) : me?.authenticated ? (
            <p className="text-sm text-gray-200 truncate">
              {me.user?.name || me.user?.email || "Ludwitt learner"}
              {spendable !== null && (
                <span className="text-emerald-300">
                  {" "}
                  · {me.balance?.spendableFormatted ?? "$0.00"} spendable
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Sign in to use Trini Tutor powered by your Ludwitt credits
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {me?.authenticated ? (
            <>
              {spendable === 0 && (
                <a
                  href={me.topUpUrl || "https://pitchrise.ludwitt.com/account/credits"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
                >
                  Top up
                </a>
              )}
              <a
                href="/auth/logout"
                className="text-[11px] px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white"
              >
                Sign out
              </a>
            </>
          ) : (
            <a
              href="/auth/login"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500 text-gray-950 hover:bg-amber-400 transition"
            >
              Sign in with Ludwitt
            </a>
          )}
        </div>
      </div>
      {authError && (
        <p className="mt-2 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
          Sign-in error: {authError}
        </p>
      )}
    </div>
  );
}
