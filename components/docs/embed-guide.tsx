"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface EmbedGuideContentProps {
  showTitle?: boolean;
  className?: string;
  apiBaseUrl?: string;
}

export function EmbedGuideContent({ showTitle = true, className = "", apiBaseUrl = "" }: EmbedGuideContentProps) {
  const [copied, setCopied] = useState(false);
  const [chartSlug, setChartSlug] = useState("mens-tops");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [compact, setCompact] = useState(false);

  const getBaseUrl = () => {
    if (apiBaseUrl) return apiBaseUrl;
    if (typeof window !== "undefined") return window.location.origin;
    return "https://your-domain.com";
  };

  const embedCode = `<!-- Size Chart Widget -->
<div data-chart="${chartSlug}"${theme !== "light" ? ` data-theme="${theme}"` : ""}${unit !== "in" ? ` data-unit="${unit}"` : ""}${compact ? ' data-compact="true"' : ""}></div>
<script src="${getBaseUrl()}/embed/size-charts.js"
        data-api="${getBaseUrl()}"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Embed Widget</h1>
          <p className="mt-2 text-muted-foreground">
            Add size charts to any website with a simple script tag.
          </p>
        </div>
      )}

      {/* Code Generator */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Code Generator</h2>
        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Chart Slug</label>
              <input
                type="text"
                value={chartSlug}
                onChange={(e) => setChartSlug(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="e.g., mens-tops"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Default Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as "in" | "cm")}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="in">Inches</option>
                <option value="cm">Centimeters</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Compact Mode</label>
              <select
                value={compact ? "true" : "false"}
                onChange={(e) => setCompact(e.target.value === "true")}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="false">Normal</option>
                <option value="true">Compact</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <pre className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100 overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-600"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </section>

      {/* Configuration Options */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Configuration Options</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Attribute</th>
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-left font-medium">Default</th>
                <th className="px-4 py-2 text-left font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2"><code className="bg-muted px-1 rounded">data-chart</code></td>
                <td className="px-4 py-2 text-muted-foreground">string</td>
                <td className="px-4 py-2 text-muted-foreground">-</td>
                <td className="px-4 py-2 text-muted-foreground">Chart slug (required)</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2"><code className="bg-muted px-1 rounded">data-theme</code></td>
                <td className="px-4 py-2 text-muted-foreground">&quot;light&quot; | &quot;dark&quot;</td>
                <td className="px-4 py-2 text-muted-foreground">light</td>
                <td className="px-4 py-2 text-muted-foreground">Color theme</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2"><code className="bg-muted px-1 rounded">data-unit</code></td>
                <td className="px-4 py-2 text-muted-foreground">&quot;in&quot; | &quot;cm&quot;</td>
                <td className="px-4 py-2 text-muted-foreground">in</td>
                <td className="px-4 py-2 text-muted-foreground">Initial unit</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2"><code className="bg-muted px-1 rounded">data-compact</code></td>
                <td className="px-4 py-2 text-muted-foreground">&quot;true&quot;</td>
                <td className="px-4 py-2 text-muted-foreground">false</td>
                <td className="px-4 py-2 text-muted-foreground">Smaller padding</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code className="bg-muted px-1 rounded">data-api-key</code></td>
                <td className="px-4 py-2 text-muted-foreground">string</td>
                <td className="px-4 py-2 text-muted-foreground">-</td>
                <td className="px-4 py-2 text-muted-foreground">API key (if required)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* JavaScript API */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">JavaScript API</h2>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm mb-3">
            The widget exposes a global <code className="bg-muted px-1 rounded">SizeCharts</code> object for programmatic control:
          </p>
          <pre className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100 overflow-x-auto">
{`// Re-initialize all widgets
SizeCharts.init();

// Initialize a specific container
SizeCharts.render(document.getElementById("my-chart"));

// Set API URL at runtime
SizeCharts.setApiUrl("https://api.example.com");`}
          </pre>
        </div>
      </section>

      {/* Demo Links */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Live Demos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="/demo"
            className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors flex items-center gap-3"
          >
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Widget Demo</div>
              <div className="text-sm text-muted-foreground">Interactive examples with configuration</div>
            </div>
          </a>
          <a
            href="/embed/demo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors flex items-center gap-3"
          >
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Standalone HTML</div>
              <div className="text-sm text-muted-foreground">Pure HTML embed example</div>
            </div>
          </a>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting</h2>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Widget shows &quot;Chart not found&quot;</h3>
            <p className="text-sm text-muted-foreground">
              Ensure the chart is published and the slug is correct. Use the API to verify: <code className="bg-muted px-1 rounded">GET /api/v1/size-charts?slug=your-slug</code>
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Widget shows &quot;Failed to load chart&quot;</h3>
            <p className="text-sm text-muted-foreground">
              Check that the <code className="bg-muted px-1 rounded">data-api</code> attribute on the script tag points to your API server. If authentication is required, include a <code className="bg-muted px-1 rounded">data-api-key</code> attribute.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">CORS errors in console</h3>
            <p className="text-sm text-muted-foreground">
              Add the embedding domain to <code className="bg-muted px-1 rounded">CORS_ALLOWED_ORIGINS</code> in your environment variables.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
