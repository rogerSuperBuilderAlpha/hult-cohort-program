"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DevBypassButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startLocal() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dev-bypass", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Bypass failed");
      }
      router.push("/modules");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bypass failed");
      setBusy(false);
    }
  }

  return (
    <div className="bypass">
      <button type="button" onClick={startLocal} disabled={busy}>
        {busy ? "Starting…" : "Start locally (dev bypass)"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
