"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function EmbedDemoPage() {
  useEffect(() => {
    // @ts-expect-error - SizeCharts is loaded from external script
    if (typeof window !== "undefined" && window.SizeCharts) {
      // @ts-expect-error - SizeCharts is loaded from external script
      window.SizeCharts.init();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Embed Widget Examples</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Pre-configured examples showing different theme and configuration options.
        </p>
      </div>

      {/* Light Theme */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Light Theme (Inches)</h2>
          <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">data-theme=&quot;light&quot;</code>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div data-chart="mens-tops" data-unit="in" data-theme="light"></div>
        </div>
        <pre className="mt-3 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
          <code>{`<div data-chart="mens-tops" data-unit="in" data-theme="light"></div>`}</code>
        </pre>
      </section>

      {/* Dark Theme */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Dark Theme (Centimeters)</h2>
          <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">data-theme=&quot;dark&quot;</code>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div data-chart="womens-bottoms" data-unit="cm" data-theme="dark"></div>
        </div>
        <pre className="mt-3 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
          <code>{`<div data-chart="womens-bottoms" data-unit="cm" data-theme="dark"></div>`}</code>
        </pre>
      </section>

      {/* Compact Mode */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Compact Mode</h2>
          <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">data-compact=&quot;true&quot;</code>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div data-chart="mens-gloves" data-unit="in" data-theme="light" data-compact="true"></div>
        </div>
        <pre className="mt-3 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
          <code>{`<div data-chart="mens-gloves" data-compact="true"></div>`}</code>
        </pre>
      </section>

      {/* Configuration Reference */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Configuration Options</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-800/50">
                <th className="px-4 py-2 text-left font-medium">Attribute</th>
                <th className="px-4 py-2 text-left font-medium">Values</th>
                <th className="px-4 py-2 text-left font-medium">Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="px-4 py-2"><code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">data-chart</code></td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Chart slug (required)</td>
                <td className="px-4 py-2 text-zinc-400">-</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">data-theme</code></td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">&quot;light&quot; | &quot;dark&quot;</td>
                <td className="px-4 py-2 text-zinc-400">light</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">data-unit</code></td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">&quot;in&quot; | &quot;cm&quot;</td>
                <td className="px-4 py-2 text-zinc-400">in</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">data-compact</code></td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">&quot;true&quot;</td>
                <td className="px-4 py-2 text-zinc-400">false</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">data-api-key</code></td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">API key string</td>
                <td className="px-4 py-2 text-zinc-400">-</td>
              </tr>
            </tbody>
          </table>
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
