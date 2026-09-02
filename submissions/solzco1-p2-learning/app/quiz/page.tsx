import { redirect } from "next/navigation";
import { getSession } from "@/lib/ludwitt/session";
import { QuizForm } from "@/components/QuizForm";

export default async function QuizPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Capstone quiz</h1>
        <p className="mt-2 text-sm text-forge-muted">
          Enterprise sales scenarios — submit to record your score with Ludwitt.
        </p>
        <div className="mt-8">
          <QuizForm />
        </div>
      </div>
    </main>
  );
}
