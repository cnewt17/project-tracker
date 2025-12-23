import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Project Tracker",
  description: "Track projects and resource allocation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <ThemeProvider>
          <Navigation />
          <main className="container mx-auto px-6 py-8 max-w-7xl">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
