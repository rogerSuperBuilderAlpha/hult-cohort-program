import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { siteOrigin } from "@/lib/links";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: "Lighthouse — Hult Cohort Summer Pilot",
    template: "%s · Lighthouse",
  },
  description:
    "Public showcase for the Hult Cohort Program. Browse participant profiles, deploy URLs, and request intros — inspect the GitHub, not the pitch.",
  openGraph: {
    title: "Lighthouse — Hult Cohort Summer Pilot",
    description:
      "Hiring-partner showcase: public profiles, live deploys, and cohort project status.",
    type: "website",
    siteName: "Lighthouse",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lighthouse — Hult Cohort Summer Pilot",
    description:
      "Hiring-partner showcase: public profiles, live deploys, and cohort project status.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
