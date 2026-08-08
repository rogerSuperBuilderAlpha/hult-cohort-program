"use client";

import { useEffect } from "react";

import { BrandedStatusContent } from "@/components/layout/branded-status-content";
import { SiteHeader } from "@/components/layout/site-header";
import { LEGAL_DISCLAIMER } from "@/lib/navigation";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="min-h-[calc(100vh-var(--site-header-height))]"
      >
        <BrandedStatusContent
          eyebrow="Something went wrong"
          title="We could not load this page"
          body="An unexpected error occurred. Please try again. If the problem continues, return to the homepage and continue from there."
          primaryLabel="Try again"
          onPrimaryClick={reset}
          secondaryLabel="Back to homepage"
          secondaryHref="/"
        />
      </main>
      <footer className="border-t border-lex-navy/8 bg-lex-pale/40 py-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p
            role="note"
            className="rounded-lg border border-lex-navy/10 bg-lex-pale/60 px-4 py-3 text-xs leading-relaxed text-lex-navy/60"
          >
            {LEGAL_DISCLAIMER}
          </p>
        </div>
      </footer>
    </>
  );
}
