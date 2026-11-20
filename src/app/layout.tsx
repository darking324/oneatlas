import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CompareBar from "@/components/CompareBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneAtlas — AI Model Discovery & Intelligence",
  description:
    "Discover, compare and evaluate AI models across providers. Real pricing, context windows, capabilities and benchmark intelligence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
          OneAtlas — AI model discovery &amp; intelligence. Model data from
          OpenRouter&apos;s public catalog; benchmark scores from vendor
          publications and Artificial Analysis.
        </footer>
        <Suspense>
          <CompareBar />
        </Suspense>
      </body>
    </html>
  );
}
