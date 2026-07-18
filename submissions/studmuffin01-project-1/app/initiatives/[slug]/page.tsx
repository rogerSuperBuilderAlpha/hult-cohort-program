import { notFound } from "next/navigation";
import PlaceholderPage from "@/components/PlaceholderPage";
import { getInitiativeBySlug, initiatives } from "@/lib/initiatives";

interface InitiativePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return initiatives.map((initiative) => ({ slug: initiative.slug }));
}

export default async function InitiativePage({ params }: InitiativePageProps) {
  const { slug } = await params;
  const initiative = getInitiativeBySlug(slug);

  if (!initiative) {
    notFound();
  }

  return <PlaceholderPage title={initiative.title} />;
}
