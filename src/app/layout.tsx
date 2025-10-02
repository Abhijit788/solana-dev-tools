import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SolanaWalletProvider from "@/components/providers/WalletProvider";
import { AppStateProvider } from "@/contexts/AppStateProvider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solana Developer Tool",
  description: "A comprehensive developer tool for Solana blockchain development",
};

// Suppress hydration warnings on body element due to browser extensions
// that may modify DOM attributes before React hydration

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppStateProvider>
          <SolanaWalletProvider>
            <div className="min-h-screen bg-gray-900 text-white font-sans antialiased">
              <Header />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
            <Toaster />
          </SolanaWalletProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
