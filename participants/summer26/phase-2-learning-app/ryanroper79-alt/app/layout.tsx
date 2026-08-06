import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'cEAL Green RFP Learner',
  description:
    'Review won and lost Request for Proposals, extract win/loss patterns, and train agents to draft stronger RFPs — integrated with Ludwitt/Hult.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-ceal-500/20 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ceal-600">cEAL Green · Ludwitt</p>
                <h1 className="text-lg font-bold text-ceal-900">RFP Learner</h1>
              </div>
              <a
                href="https://www.cealgreen.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-ceal-500/10 px-3 py-1 text-xs font-medium text-ceal-700 hover:bg-ceal-500/20"
              >
                cealgreen.com
              </a>
            </div>
          </header>
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
