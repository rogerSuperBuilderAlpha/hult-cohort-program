import type { Metadata } from "next";
import "@fontsource/inter";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

/** Page metadata shown in the browser tab and search engines */
export const metadata: Metadata = {
  title: "Initiara",
  description: "Initiara application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider initialUser={user}>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}