import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ACCENT_COOKIE, normalizeAccent, THEME_COOKIE } from "@/lib/theme";
import { readableText } from "@/lib/labels";

export const metadata: Metadata = {
  title: "FlexiFlow — Project management, your way",
  description:
    "FlexiFlow is a fully customizable project management platform: build workspaces, define your own statuses, fields, labels, views, and automations to match how your team actually works.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  const theme = jar.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";
  const accent = normalizeAccent(jar.get(ACCENT_COOKIE)?.value);

  return (
    <html lang="en" data-theme={theme}>
      <body className="antialiased">
        <style>{`:root{--accent:${accent};--accent-ink:${readableText(accent)};}`}</style>
        {children}
      </body>
    </html>
  );
}
