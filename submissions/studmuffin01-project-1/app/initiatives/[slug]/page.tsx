import { redirect } from "next/navigation";
import { getInitiativeAnchorId } from "@/lib/initiatives";

interface InitiativePageProps {
  params: Promise<{ slug: string }>;
}

export default async function InitiativePage({ params }: InitiativePageProps) {
  const { slug } = await params;
  redirect(`/#${getInitiativeAnchorId(slug)}`);
}
