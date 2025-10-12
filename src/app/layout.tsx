import type { Metadata } from "next";
import { Scheherazade_New, Raleway } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/ToastProvider";

const arabicFont = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
});

const englishFont = Raleway({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-english",
});

export const metadata: Metadata = {
  title: "Ateeq Arabic Quiz App",
  description: "Crash course quizzes for learning Arabic basics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${englishFont.variable} ${arabicFont.variable}`}
    >
      {/* <body className="antialiased">{children}</body> */}

      <body className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col">
        <ToastProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 bg-[var(--primary)] text-white shadow-md">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              {/* Logo / Title */}
              <Link
                href="/"
                className="text-2xl font-bold tracking-wide hover:opacity-90 transition"
              >
                <span className="text-[#fdc700]">Ateeq</span> Quiz
              </Link>

              {/* Navigation */}
              {/* <nav className="space-x-6">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                <Link href="/about" className="hover:underline">
                  About
                </Link>
              </nav> */}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-6 py-8">{children}</main>

          {/* Footer */}
          <footer className="bg-[var(--secondary)] text-white mt-12">
            <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm">
              © {new Date().getFullYear()} Ateeq Quiz. All rights reserved.
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
