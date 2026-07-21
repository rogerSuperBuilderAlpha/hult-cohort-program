import { notFound } from "next/navigation";
import PlaceholderPage from "@/components/PlaceholderPage";
import { DEFAULT_INITIATIVES, getInitiativeBySlug } from "@/lib/initiatives";

interface InitiativePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEFAULT_INITIATIVES.map((initiative) => ({ slug: initiative.slug }));
}

export default async function InitiativePage({ params }: InitiativePageProps) {
  const { slug } = await params;
  const initiative = getInitiativeBySlug(slug);

  if (!initiative) {
    notFound();
  }

  return <PlaceholderPage title={initiative.title} />;
}
