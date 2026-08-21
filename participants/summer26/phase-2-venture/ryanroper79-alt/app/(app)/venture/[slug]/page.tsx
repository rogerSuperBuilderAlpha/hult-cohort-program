import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VentureDocView, ventureDocSlugs } from '@/components/VentureDocs';
import { Disclaimer } from '@/components/Disclaimer';

export function generateStaticParams() {
  return ventureDocSlugs().map((slug) => ({ slug }));
}

export default async function VentureDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!ventureDocSlugs().includes(slug)) notFound();

  return (
    <div className="space-y-6">
      <p className="text-sm text-ceal-700">
        <Link href="/venture" className="underline">
          ← All venture materials
        </Link>
      </p>
      <VentureDocView slug={slug} />
      <Disclaimer />
    </div>
  );
}
