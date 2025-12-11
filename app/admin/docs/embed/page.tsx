"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Badge, Input, SimpleSelect } from "@/components/ui";
import { ArrowLeft, Copy, Check, ExternalLink, Code2, Palette, Zap } from "lucide-react";

export default function EmbedDocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [chartSlug, setChartSlug] = useState("mens-tops");
  const [theme, setTheme] = useState("light");
  const [unit, setUnit] = useState("in");
  const [compact, setCompact] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const embedCode = `<!-- Size Chart Widget -->
<div data-chart="${chartSlug}"
     data-theme="${theme}"
     data-unit="${unit}"${compact ? '\n     data-compact="true"' : ""}></div>
<script src="${baseUrl}/embed/size-charts.js"
        data-api="${baseUrl}"></script>`;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/docs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Documentation
        </Link>
        <h1 className="text-2xl font-bold">Embed Widget</h1>
        <p className="mt-2 text-muted-foreground">
          Add size charts to any website with a simple script tag.
        </p>
      </div>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Add these two elements to your HTML page. The widget will automatically render when the page loads.
          </p>
          <div className="relative">
            <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(embedCode, "quick")}
            >
              {copied === "quick" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>

      {/* Code Generator */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Code Generator</h2>
        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Chart Slug</label>
              <Input
                value={chartSlug}
                onChange={(e) => setChartSlug(e.target.value)}
                placeholder="e.g., mens-tops"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Theme</label>
              <SimpleSelect
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Default Unit</label>
              <SimpleSelect
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={[
                  { value: "in", label: "Inches" },
                  { value: "cm", label: "Centimeters" },
                ]}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Compact</label>
              <SimpleSelect
                value={compact ? "true" : "false"}
                onChange={(e) => setCompact(e.target.value === "true")}
                options={[
                  { value: "false", label: "Normal" },
                  { value: "true", label: "Compact" },
                ]}
              />
            </div>
          </div>
          <div className="relative">
            <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(embedCode, "generator")}
            >
              {copied === "generator" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <Code2 className="h-5 w-5 text-blue-500 mb-2" />
            <h3 className="font-medium mb-1">Zero Dependencies</h3>
            <p className="text-sm text-muted-foreground">
              Pure JavaScript, no frameworks required. Works with any website.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Palette className="h-5 w-5 text-purple-500 mb-2" />
            <h3 className="font-medium mb-1">Theming Support</h3>
            <p className="text-sm text-muted-foreground">
              Light and dark themes with consistent styling.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Zap className="h-5 w-5 text-amber-500 mb-2" />
            <h3 className="font-medium mb-1">Unit Toggle</h3>
            <p className="text-sm text-muted-foreground">
              Users can switch between inches and centimeters.
            </p>
          </div>
        </div>
      </section>

      {/* Configuration Options */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Configuration Options</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Attribute</th>
                <th className="text-left p-3 font-medium">Values</th>
                <th className="text-left p-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">data-chart</code></td>
                <td className="p-3 text-muted-foreground">String</td>
                <td className="p-3"><Badge variant="secondary" className="mr-2">Required</Badge>Chart slug to display</td>
              </tr>
              <tr>
                <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">data-unit</code></td>
                <td className="p-3 text-muted-foreground"><code>in</code> | <code>cm</code></td>
                <td className="p-3">Default measurement unit. Default: <code>in</code></td>
              </tr>
              <tr>
                <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">data-theme</code></td>
                <td className="p-3 text-muted-foreground"><code>light</code> | <code>dark</code></td>
                <td className="p-3">Color theme. Default: <code>light</code></td>
              </tr>
              <tr>
                <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">data-compact</code></td>
                <td className="p-3 text-muted-foreground"><code>true</code></td>
                <td className="p-3">Enable compact mode with smaller padding</td>
              </tr>
              <tr>
                <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">data-api-key</code></td>
                <td className="p-3 text-muted-foreground">String</td>
                <td className="p-3">API key for authenticated requests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Script Options */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Script Options</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Attribute</th>
                <th className="text-left p-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">data-api</code></td>
                <td className="p-3">Base URL of your Size Charts API (e.g., <code>https://your-domain.com</code>)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* JavaScript API */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">JavaScript API</h2>
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Re-initialize all widgets</h3>
            <pre className="rounded-lg bg-muted p-4 text-sm">
              <code>SizeCharts.init();</code>
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Render a specific container</h3>
            <pre className="rounded-lg bg-muted p-4 text-sm">
              <code>{`SizeCharts.render(document.getElementById('my-chart'));`}</code>
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Set API URL programmatically</h3>
            <pre className="rounded-lg bg-muted p-4 text-sm">
              <code>{`SizeCharts.setApiUrl('https://your-domain.com');`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Demo Link */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Live Demo</h2>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-4">
            See the widget in action with multiple configurations.
          </p>
          <Link href="/embed/demo.html" target="_blank">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Demo Page
            </Button>
          </Link>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting</h2>
        <div className="rounded-lg border bg-card divide-y">
          <div className="p-4">
            <h3 className="font-medium mb-1">Widget shows &quot;Chart not found&quot;</h3>
            <p className="text-sm text-muted-foreground">
              Verify the chart slug is correct and the chart is published. Unpublished charts are not accessible via the API.
            </p>
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-1">Widget shows &quot;Failed to load chart&quot;</h3>
            <p className="text-sm text-muted-foreground">
              Check that the <code>data-api</code> attribute points to the correct API URL and CORS is configured to allow your domain.
            </p>
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-1">Widget not rendering</h3>
            <p className="text-sm text-muted-foreground">
              Ensure the script is loaded after the container element exists in the DOM, or call <code>SizeCharts.init()</code> after dynamic content loads.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
