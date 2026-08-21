import { SiteHeader } from '@/components/SiteHeader';

export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {children}
      </main>
    </>
  );
}
