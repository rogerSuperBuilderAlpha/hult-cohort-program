import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { SignInForm } from "./signin-form";

export default async function SignInPage() {
  const user = await currentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold text-white">Welcome back</h1>
      <p className="mt-2 text-slate-400">Sign in to keep your streak going.</p>
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  );
}
