import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Greenularity Caribbean™ | CEAL Green Energy Auditor',
  description:
    'AI-assisted energy intelligence for the Caribbean — digitize bills, decide on upgrades, and decarbonize with CEAL Green.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
