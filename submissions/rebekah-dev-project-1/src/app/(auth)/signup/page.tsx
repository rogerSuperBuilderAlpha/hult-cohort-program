import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage() {
  const user = await currentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold text-white">Join the cohort</h1>
      <p className="mt-2 text-slate-400">
        Create your account to track projects, tasks, and streaks.
      </p>
      <SignUpForm />
    </main>
  );
}
