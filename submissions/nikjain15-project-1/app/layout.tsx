import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulse — the board that updates itself",
  description:
    "Do the work. Pulse spots it, moves your card, and tells your team — nobody types in status again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <AuthProvider>{children}</AuthProvider>
        {/*
          Aggregate page views only — cookieless, no identifiers, no per-person journeys.
          Deliberately the weakest analytics that answers "did anyone open it", because
          this product refuses to show the cohort who is quiet (§6.2) and then quietly
          recording exactly that for the operator would be a double standard a reviewer
          would be right to call out.

          Because it collects something the landing page's disclosure didn't originally
          cover, the disclosure says so. The disclosure follows the behaviour, not the
          other way round.
        */}
        <Analytics />
      </body>
    </html>
  );
}
