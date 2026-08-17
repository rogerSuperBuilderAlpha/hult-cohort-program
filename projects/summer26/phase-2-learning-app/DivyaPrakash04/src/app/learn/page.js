import { redirect } from "next/navigation";
import { publicProfile, readSession } from "@/lib/auth";
import { lessons, quizzes } from "@/lib/course";
import LearningClient from "./LearningClient";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const profile = await readSession();
  if (!profile) redirect("/");

  return <LearningClient profile={publicProfile(profile)} lessons={lessons} quizzes={quizzes} />;
}
