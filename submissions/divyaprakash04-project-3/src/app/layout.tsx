import type { Metadata } from 'next';
import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
    title: 'VibeHub — Hult Cursor Cohort 3',
    description: 'A high-energy marketing surface for the Hult Cursor Cohort 3 builders.',
    keywords: ['VibeHub', 'Hult', 'Cohort 3', 'AI products', 'builder showcase'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className="scroll-smooth">
            <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
                <div className="relative min-h-screen overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_30%)]" />
                    <div className="relative flex min-h-screen flex-col">
                        <div className="flex-1">{children}</div>
                        <footer className="border-t border-slate-800/70 bg-slate-950/60 px-6 py-6 text-center text-sm text-slate-400 backdrop-blur">
                            VibeHub is a launch-ready story surface for Hult Cursor Cohort 3.
                        </footer>
                    </div>
                </div>
            </body>
        </html>
    );
}
