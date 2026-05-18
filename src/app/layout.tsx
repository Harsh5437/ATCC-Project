import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import QueryProvider from '@/lib/providers/QueryProvider';
import { Shell } from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: "ATCC Dashboard",
  description: "AI-powered Automatic Traffic Counter and Classifier Platform",
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <Shell>{children}</Shell>
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
