"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LaunchGate() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setError("missing");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setError("invalid");
        return;
      }
      router.replace("/learn");
    });
  }, [token, router]);

  if (error === "missing" || error === "invalid") {
    return (
      <section className="gate">
        <h1>Launch from Ludwitt/Hult</h1>
        <p>
          Pattern Forge only starts a counted learning session when the platform
          redirects here with a signed JWT. Open the app from the Ludwitt/Hult
          directory — or use the developer launch-token endpoint during review.
        </p>
      </section>
    );
  }

  return (
    <section className="gate">
      <h1>Opening session…</h1>
      <p>{pending ? "Validating launch token and starting your lesson." : "Almost there."}</p>
    </section>
  );
}
