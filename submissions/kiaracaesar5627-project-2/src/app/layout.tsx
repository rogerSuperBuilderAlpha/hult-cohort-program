import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chorus — Cohort communications",
  description:
    "Chorus is focused team chat for the Hult Cohort: channels, DMs, announcements, search, and live updates.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
