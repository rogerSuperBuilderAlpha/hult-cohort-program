import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comms — Cohort communications",
  description:
    "Focused team chat for the Hult Cohort: channels, DMs, announcements, search, and real-time updates.",
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
