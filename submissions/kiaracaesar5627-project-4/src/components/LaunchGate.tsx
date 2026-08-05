"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SITE } from "@/lib/site";

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
      router.replace("/practice");
    });
  }, [token, router]);

  if (error === "missing" || error === "invalid") {
    return (
      <section className="gate">
        <h1>Launch from Ludwitt/Hult</h1>
        <p>
          {SITE.name} only opens a counted interview session when the platform
          redirects here with a signed JWT. Start from the Ludwitt/Hult
          directory — or mint a launch token during review.
        </p>
      </section>
    );
  }

  return (
    <section className="gate">
      <h1>Opening the room…</h1>
      <p>
        {pending
          ? "Validating your launch token and seating you for practice."
          : "Almost there."}
      </p>
    </section>
  );
}
