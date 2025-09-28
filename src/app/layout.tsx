import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SolanaWalletProvider from "@/components/providers/WalletProvider";
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
        <SolanaWalletProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
