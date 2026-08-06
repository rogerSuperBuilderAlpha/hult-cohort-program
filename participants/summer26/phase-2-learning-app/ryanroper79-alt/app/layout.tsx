import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'cEAL Green Bid Manager',
  description: 'Finder + Qualifier for DFI and Caribbean procurement — Week 4 Ludwitt integration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-ceal-500/20 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ceal-600">cEAL Green · Bid Manager</p>
                <h1 className="text-lg font-bold text-ceal-900">Finder + Qualifier</h1>
              </div>
              <span className="rounded-full bg-ceal-500/10 px-3 py-1 text-xs font-medium text-ceal-700">
                Public instance · no CEAL data
              </span>
            </div>
          </header>
          <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
            <Nav />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
