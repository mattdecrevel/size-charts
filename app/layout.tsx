import type { Metadata } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title: {
    default: "Size Charts - Open Source Size Chart Management",
    template: "%s | Size Charts",
  },
  description: "Open-source size chart management system for e-commerce. Create, manage, and embed size charts with a REST API and embeddable widget.",
  keywords: ["size chart", "e-commerce", "sizing guide", "clothing sizes", "open source"],
  authors: [{ name: "Matt Decrevel" }],
  metadataBase: new URL("https://sizecharts.dev"),
  openGraph: {
    title: "Size Charts - Open Source Size Chart Management",
    description: "Create, manage, and embed size charts for your e-commerce platform. Free and open source.",
    url: "https://sizecharts.dev",
    siteName: "Size Charts",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Size Charts - Open Source Size Chart Management",
    description: "Create, manage, and embed size charts for your e-commerce platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
