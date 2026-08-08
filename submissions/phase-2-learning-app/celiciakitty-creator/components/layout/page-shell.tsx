import { LegalDisclaimer } from "@/components/layout/legal-disclaimer";
import { SiteHeader } from "@/components/layout/site-header";

type PageShellProps = {
  children: React.ReactNode;
  showDisclaimer?: boolean;
};

export function PageShell({
  children,
  showDisclaimer = true,
}: PageShellProps) {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="min-h-[calc(100vh-var(--site-header-height))]"
      >
        {children}
      </main>
      {showDisclaimer && (
        <footer className="border-t border-lex-navy/8 bg-lex-pale/40 py-4">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <LegalDisclaimer variant="banner" />
          </div>
        </footer>
      )}
    </>
  );
}
