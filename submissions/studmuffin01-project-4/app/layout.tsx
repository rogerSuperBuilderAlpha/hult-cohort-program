import type { Metadata } from "next";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";
import { SiteHeader } from "@/components/SiteHeader";
import { courseMeta } from "@/content/course";
import { readSession } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: courseMeta.title,
    template: `%s · ${courseMeta.title}`,
  },
  description: courseMeta.tagline,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await readSession();

  return (
    <html lang="en">
      <body>
        <div className="shell">
          <SiteHeader />
          <main>{children}</main>
        </div>
        <SessionHeartbeat enabled={Boolean(session)} />
      </body>
    </html>
  );
}
