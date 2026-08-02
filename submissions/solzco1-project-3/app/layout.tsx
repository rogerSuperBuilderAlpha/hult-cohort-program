import type { Metadata } from "next";
import { PulseShell } from "@/components/PulseShell";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Pulse — Hult Developer Cohort",
    template: "%s · Pulse",
  },
  description:
    "Live telemetry and heartbeat of the Hult Developer Cohort Summer Pilot 2026. Inspect builders, deployments, and partner-ready evidence — not a sterile directory.",
  openGraph: {
    title: "Pulse — Hult Developer Cohort",
    description:
      "Vibe marketing engine for cohort builders — live ships, profiles, and partner conversion.",
    type: "website",
    siteName: "Pulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse — Hult Developer Cohort",
    description:
      "Live cohort telemetry · builder profiles · partner portal",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-vibe="cyberpunk" className="h-full">
      <body className="min-h-full font-sans antialiased">
        <PulseShell>{children}</PulseShell>
      </body>
    </html>
  );
}
