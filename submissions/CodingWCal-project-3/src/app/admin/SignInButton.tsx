"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="inline-block px-5 py-2.5 rounded-[4px] bg-vibe-accent text-white text-sm font-semibold hover:bg-vibe-accent-hover transition-colors cursor-pointer"
    >
      Sign in with GitHub
    </button>
  );
}
