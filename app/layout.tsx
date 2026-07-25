import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hult Hub — Hult Summer Pilot 2026",
  description: "The internal communications hub for the Hult Cohort Developer Program Summer Pilot 2026.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#6d5dfc" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
