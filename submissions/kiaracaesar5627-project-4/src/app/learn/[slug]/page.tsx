import { redirect } from "next/navigation";
import { getLesson, roundPath } from "@/lib/lessons";

type Props = { params: Promise<{ slug: string }> };

export default async function LearnSlugRedirect({ params }: Props) {
  const { slug } = await params;
  const round = getLesson(slug);
  redirect(round ? roundPath(round) : "/practice");
}
