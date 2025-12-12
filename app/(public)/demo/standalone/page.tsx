"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function StandaloneDemoPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (scriptLoaded) {
      // @ts-expect-error - SizeCharts is loaded from external script
      window.SizeCharts?.init();
    }
  }, [scriptLoaded]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Standalone HTML Demo</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          This demonstrates how the widget looks when embedded in a plain HTML page with minimal styling.
        </p>
      </div>

      {/* Simulated external page */}
      <div className="rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white p-8">
        <div className="mb-6 pb-4 border-b border-zinc-200">
          <p className="text-sm text-zinc-500 italic">
            ↓ This is how the widget appears on an external website ↓
          </p>
        </div>

        {/* Example 1: Men's Tops */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Men&apos;s Tops Size Chart
          </h2>
          <div data-chart="mens-tops" data-theme="light" data-unit="in"></div>
        </div>

        {/* Example 2: Women's Bottoms - Dark */}
        <div className="mb-8 bg-zinc-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-white" style={{ fontFamily: "Georgia, serif" }}>
            Women&apos;s Bottoms Size Chart
          </h2>
          <div data-chart="womens-bottoms" data-theme="dark" data-unit="cm"></div>
        </div>

        {/* Example 3: Compact */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Men&apos;s Gloves (Compact)
          </h2>
          <div data-chart="mens-gloves" data-theme="light" data-compact="true"></div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-200">
          <p className="text-sm text-zinc-500 italic">
            ↑ End of embedded widgets ↑
          </p>
        </div>
      </div>

      {/* The embed code */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Embed Code Used</h2>
        <pre className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100 overflow-x-auto">
          <code>{`<!-- Add this where you want the chart -->
<div data-chart="mens-tops"></div>

<!-- Add this once, before </body> -->
<script src="${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/embed/size-charts.js"
        data-api="${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}"></script>`}</code>
        </pre>
      </div>

      {/* Load the embed script */}
      <Script
        src="/embed/size-charts.js"
        data-api=""
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
    </div>
  );
}
