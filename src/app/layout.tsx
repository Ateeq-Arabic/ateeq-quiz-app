import type { Metadata } from "next";
import { Scheherazade_New, Raleway } from "next/font/google";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
