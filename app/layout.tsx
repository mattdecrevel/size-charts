import type { Metadata } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// Primary font - Sora: A soft, rounded geometric sans-serif
// Modern but friendly, with beautiful curves and excellent readability
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

// Monospace for code blocks
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Size Charts Manager",
  description: "Manage size charts for your e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
