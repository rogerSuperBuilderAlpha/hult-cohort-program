import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Cohort PM Tool",
  description: "Project management platform for the Hult Cohort Developer Program",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NavBar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
