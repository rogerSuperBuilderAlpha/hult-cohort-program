"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthUser = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

type AuthState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "guest" }
  | { status: "authenticated"; user: AuthUser };

export function AuthHeaderActions({ className }: { className?: string }) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function loadAuth() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) throw new Error("auth check failed");
        const data = (await response.json()) as {
          configured?: boolean;
          authenticated: boolean;
          user: AuthUser | null;
        };
        if (cancelled) return;
        if (data.configured === false) {
          setAuth({ status: "unconfigured" });
          return;
        }
        if (data.authenticated && data.user) {
          setAuth({ status: "authenticated", user: data.user });
        } else {
          setAuth({ status: "guest" });
        }
      } catch {
        if (!cancelled) setAuth({ status: "guest" });
      }
    }

    loadAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  if (auth.status === "loading" || auth.status === "unconfigured") {
    if (auth.status === "unconfigured") return null;
    return (
      <div
        className={cn("h-9 w-28 animate-pulse rounded-lg bg-lex-pale", className)}
        aria-hidden
      />
    );
  }

  if (auth.status === "guest") {
    return (
      <Link
        href="/auth/login"
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg bg-lex-navy px-4 text-sm font-medium text-white shadow-sm hover:bg-lex-navy/90",
          className
        )}
      >
        Sign in with Ludwitt
      </Link>
    );
  }

  const displayName = auth.user.name ?? auth.user.email ?? "Learner";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="hidden items-center gap-2 sm:flex">
        {auth.user.picture ? (
          <Image
            src={auth.user.picture}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full border border-lex-navy/10 object-cover"
            unoptimized
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-lex-pale text-xs font-semibold text-lex-navy ring-1 ring-lex-navy/10">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="max-w-[8rem] truncate text-sm font-medium text-lex-navy">
          {displayName}
        </span>
      </div>
      <form action="/auth/logout" method="post">
        <Button
          type="submit"
          variant="outline"
          size="icon"
          className="size-9 border-lex-navy/12 bg-white text-lex-navy shadow-sm hover:bg-lex-pale"
          aria-label="Sign out of Ludwitt"
        >
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}
