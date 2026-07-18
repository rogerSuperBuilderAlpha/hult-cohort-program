"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signUp(email, password, name);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Rivera"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@cohort.dev"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="py-2.5 rounded-lg font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-sm mt-6" style={{ color: "var(--text-muted)" }}>
        Already enrolled?{" "}
        <Link href="/login" style={{ color: "var(--accent-hover)" }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
