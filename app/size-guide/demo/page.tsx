"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, ExternalLink } from "lucide-react";
import Script from "next/script";

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
        Back to Size Guide
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Code2 className="h-6 w-6" />
          Embed Widget Demo
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          See the embeddable size chart widget in action. This same widget can be added to any website.
        </p>
      </div>

      {/* Light Theme Demo */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
          Light Theme (Inches)
        </h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white p-6">
          <div data-chart="mens-tops" data-unit="in" data-theme="light"></div>
        </div>
      </section>

      {/* Dark Theme Demo */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
          Dark Theme (Centimeters)
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div data-chart="womens-bottoms" data-unit="cm" data-theme="dark"></div>
        </div>
      </section>

      {/* Compact Demo */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
          Compact Mode
        </h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white p-6">
          <div data-chart="mens-gloves" data-unit="in" data-theme="light" data-compact="true"></div>
        </div>
      </section>

      {/* Integration Info */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          Add to Your Website
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Copy and paste this code to embed size charts on your website:
        </p>
        <pre className="rounded-lg bg-zinc-900 text-zinc-300 p-4 text-sm overflow-x-auto">
          <code>{`<!-- Size Chart Widget -->
<div data-chart="mens-tops" data-theme="light"></div>
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/embed/size-charts.js"
        data-api="${typeof window !== "undefined" ? window.location.origin : ""}"></script>`}</code>
        </pre>
        <div className="mt-4">
          <Link
            href="/admin/docs/embed"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <ExternalLink className="h-4 w-4" />
            View Full Documentation
          </Link>
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
