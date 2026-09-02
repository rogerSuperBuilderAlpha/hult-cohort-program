import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealForge — Enterprise Sales Learning",
  description:
    "B2B sales training: discovery, business cases, and enterprise negotiation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
