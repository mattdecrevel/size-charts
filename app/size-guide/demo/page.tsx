"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Script from "next/script";
import { EmbedGuideContent } from "@/components/docs";

export default function EmbedDemoPage() {
  // Re-initialize widgets after script loads
  useEffect(() => {
    // @ts-expect-error - SizeCharts is loaded from external script
    if (typeof window !== "undefined" && window.SizeCharts) {
      // @ts-expect-error - SizeCharts is loaded from external script
      window.SizeCharts.init();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/size-guide"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <EmbedGuideContent />

      {/* Live Widget Examples */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Live Examples</h2>

        {/* Light Theme */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-3">
            Light Theme (Inches)
          </h3>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white p-6">
            <div data-chart="mens-tops" data-unit="in" data-theme="light"></div>
          </div>
        </div>

        {/* Dark Theme */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-3">
            Dark Theme (Centimeters)
          </h3>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div data-chart="womens-bottoms" data-unit="cm" data-theme="dark"></div>
          </div>
        </div>

        {/* Compact */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-3">
            Compact Mode
          </h3>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white p-6">
            <div data-chart="mens-gloves" data-unit="in" data-theme="light" data-compact="true"></div>
          </div>
        </div>
      </section>

      {/* Load the embed script */}
      <Script
        src="/embed/size-charts.js"
        data-api=""
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-expect-error - SizeCharts is loaded from external script
          if (window.SizeCharts) {
            // @ts-expect-error - SizeCharts is loaded from external script
            window.SizeCharts.init();
          }
        }}
      />
    </div>
  );
}
