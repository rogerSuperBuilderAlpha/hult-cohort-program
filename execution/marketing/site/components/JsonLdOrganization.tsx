import { programStructuredData } from '@/lib/program-jsonld';

export function JsonLdOrganization() {
  const data = programStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
