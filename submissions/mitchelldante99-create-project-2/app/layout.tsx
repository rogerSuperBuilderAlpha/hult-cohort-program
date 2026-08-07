import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascended Learning",
  description: "Study and revision techniques that actually work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
