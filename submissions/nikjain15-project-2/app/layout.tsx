import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "../lib/auth-context";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rally — the cohort, in sync",
  description:
    "Where the cohort talks, tracks what they promised, and lifts the people who help. One place for 65.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${jetbrains.variable} h-full`}
    >
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
        {/* Aggregate, cookieless page views only — no per-person journeys. */}
        <Analytics />
      </body>
    </html>
  );
}
