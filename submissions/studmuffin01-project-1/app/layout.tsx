import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
  variable: "--font-syne",
});

/** Page metadata shown in the browser tab and search engines */
export const metadata: Metadata = {
  title: "INITIARA",
  description: "Executive summary dashboard for initiative cohort progress",
};

/**
 * Root layout — wraps every page in the app.
 * Sets up fonts, global styles, and the main HTML structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} ${syne.variable} min-h-screen`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
