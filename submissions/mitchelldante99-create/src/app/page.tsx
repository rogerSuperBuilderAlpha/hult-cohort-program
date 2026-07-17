"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <div className="max-w-2xl mx-auto px-5 py-20 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        Ship visibly. Track everything.
      </h1>
      <p style={{ color: "var(--text-muted)" }} className="text-lg mb-10">
        The project management platform built by and for the Hult Cohort
        Developer Program: accounts, projects, tasks, and status workflows
        in one place.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/signup"
          className="px-6 py-3 rounded-lg font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Create account
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg font-semibold border"
          style={{ borderColor: "var(--border)" }}
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
