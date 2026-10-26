"use client";

import { useEffect, useState } from "react";

export function CreditsBadge() {
  const [spendable, setSpendable] = useState<number | null>(null);
  const [topUp, setTopUp] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/credits")
      .then(async (r) => {
        if (!r.ok) return;
        const data = (await r.json()) as {
          spendableCents?: number;
          topUpUrl?: string;
        };
        if (typeof data.spendableCents === "number") {
          setSpendable(data.spendableCents);
        }
        if (data.topUpUrl) setTopUp(data.topUpUrl);
      })
      .catch(() => undefined);
  }, []);

  if (spendable === null) return null;

  return (
    <span className="rounded bg-forge-gold/20 px-2 py-1 text-xs text-forge-gold">
      Ludwitt credits: ${(spendable / 100).toFixed(2)} spendable
      {spendable === 0 && topUp ? (
        <>
          {" "}
          ·{" "}
          <a href={topUp} className="underline" target="_blank" rel="noreferrer">
            Top up
          </a>
        </>
      ) : null}
    </span>
  );
}
