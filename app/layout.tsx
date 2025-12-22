import type { Metadata } from "next";
import "./globals.css";
import { LayoutGrid } from "lucide-react";

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
      <body className="antialiased min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Project Tracker
                </h1>
              </div>
              <div className="flex items-center space-x-6">
                <a
                  href="/"
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/projects"
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Projects
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
