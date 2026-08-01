import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F6F3" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1A" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Cursor Boston × Hult — Vibe Showcase",
    template: "%s — Cursor Boston × Hult Showcase",
  },
  description:
    "Curated editorial showcase of the best weekly builds from the Cursor Boston × Hult cohort. Warm design, clean typography, zero cruft.",
  openGraph: {
    title: "Cursor Boston × Hult — Vibe Showcase",
    description:
      "Curated editorial showcase of the best weekly builds from the Cursor Boston × Hult cohort.",
    siteName: "Vibe Showcase",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.body.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <Header />
        <main className="mx-auto w-full max-w-[1280px] flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
