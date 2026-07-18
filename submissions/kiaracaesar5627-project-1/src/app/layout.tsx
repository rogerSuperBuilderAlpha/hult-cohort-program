import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pilot — Hult Cohort PM",
  description:
    "Project management for the Hult Cohort Developer Program: projects, tasks, assignments, and ship momentum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <style>{`:root{--font-display:var(--font-fraunces);--font-body:var(--font-manrope);}`}</style>
        {children}
      </body>
    </html>
  );
}
