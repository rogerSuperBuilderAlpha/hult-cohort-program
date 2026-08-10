import { BrandedStatusContent } from "@/components/layout/branded-status-content";
import { PageShell } from "@/components/layout/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <BrandedStatusContent
        eyebrow="Page not found"
        title="This page does not exist"
        body="The link may be outdated or the page may have moved. Return to LexLearn to continue your UK law learning journey."
        primaryLabel="Go to homepage"
        primaryHref="/"
        secondaryLabel="Browse modules"
        secondaryHref="/learn"
      />
    </PageShell>
  );
}
