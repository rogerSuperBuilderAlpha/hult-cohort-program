import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Huddle — Cohort communications",
  description:
    "Huddle is focused team chat for the Hult Cohort: channels, DMs, announcements, search, and live updates.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value);

  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
