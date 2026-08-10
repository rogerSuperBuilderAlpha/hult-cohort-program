"use client";

import { useEffect, useState } from "react";

import { LudwittSignInPrompt } from "@/components/learn/ludwitt-sign-in-prompt";

type LudwittAuthGateProps = {
  children: React.ReactNode;
  returnPath: string;
  title?: string;
  description?: string;
};

export function LudwittAuthGate({
  children,
  returnPath,
  title = "Sign in to start learning",
  description = "LexLearn uses Ludwitt to identify you before tracking lesson progress, quiz results, and achievements.",
}: LudwittAuthGateProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "guest">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as {
          configured?: boolean;
          authenticated: boolean;
        };
        if (!cancelled) {
          if (data.configured === false) {
            setStatus("authenticated");
            return;
          }
          setStatus(data.authenticated ? "authenticated" : "guest");
        }
      } catch {
        if (!cancelled) setStatus("guest");
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-lex-navy/60">
        Checking sign-in…
      </div>
    );
  }

  if (status === "guest") {
    return (
      <LudwittSignInPrompt
        title={title}
        description={description}
        returnPath={returnPath}
      />
    );
  }

  return <>{children}</>;
}
