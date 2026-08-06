import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Climate Skills for Builders',
  description:
    'Micro-lessons on carbon literacy, green software, and climate communications — integrated with Ludwitt/Hult.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-leaf-500/20 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-leaf-700">Ludwitt learning</p>
                <h1 className="text-lg font-bold text-leaf-900">Climate Skills for Builders</h1>
              </div>
              <span className="rounded-full bg-leaf-500/10 px-3 py-1 text-xs font-medium text-leaf-700">
                @ryanroper79-alt
              </span>
            </div>
          </header>
          <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
