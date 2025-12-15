"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { Copy, Check, RefreshCw, ExternalLink } from "lucide-react";

export default function EmbedDocsPage() {
	const [chartSlug, setChartSlug] = useState("mens-tops");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [unit, setUnit] = useState<"in" | "cm">("in");
	const [compact, setCompact] = useState(false);
	const [copied, setCopied] = useState(false);
	const [previewKey, setPreviewKey] = useState(0);

	const getBaseUrl = () => {
		if (typeof window !== "undefined") return window.location.origin;
		return "https://www.sizecharts.dev";
	};

	const embedCode = `<div data-chart="${chartSlug}"${theme !== "light" ? ` data-theme="${theme}"` : ""}${unit !== "in" ? ` data-unit="${unit}"` : ""}${compact ? ' data-compact="true"' : ""}></div>
<script src="${getBaseUrl()}/embed/size-charts.js" data-api="${getBaseUrl()}"></script>`;

	const copyToClipboard = () => {
		navigator.clipboard.writeText(embedCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const refreshPreview = () => {
		setPreviewKey((k) => k + 1);
	};

	// Re-init widget when config changes
	useEffect(() => {
		// @ts-expect-error - SizeCharts is loaded from external script
		if (typeof window !== "undefined" && window.SizeCharts) {
			// @ts-expect-error - SizeCharts is loaded from external script
			window.SizeCharts.init();
		}
	}, [previewKey, chartSlug, theme, unit, compact]);

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-2xl font-bold">Embed Widget</h1>
				<p className="mt-2 text-muted-foreground">
					Add size charts to any website with a simple script tag. Configure options below and see a live preview.
				</p>
			</div>

			{/* Live Builder Section */}
			<section className="mb-12">
				<h2 className="text-lg font-semibold mb-4">Live Builder</h2>
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Configuration Panel */}
					<div className="rounded-lg border bg-card p-5">
						<h3 className="text-sm font-semibold mb-4">Configuration</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">
									Chart Slug
								</label>
								<input
									type="text"
									value={chartSlug}
									onChange={(e) => setChartSlug(e.target.value)}
									className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
									placeholder="e.g., mens-tops"
								/>
								<p className="mt-1 text-xs text-muted-foreground">
									Try: mens-tops, womens-tops, mens-gloves
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1">Theme</label>
								<div className="flex gap-2">
									<button
										onClick={() => setTheme("light")}
										className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
											theme === "light"
												? "border-primary bg-primary text-primary-foreground"
												: "border-border hover:bg-muted"
										}`}
									>
										Light
									</button>
									<button
										onClick={() => setTheme("dark")}
										className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
											theme === "dark"
												? "border-primary bg-primary text-primary-foreground"
												: "border-border hover:bg-muted"
										}`}
									>
										Dark
									</button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1">Default Unit</label>
								<div className="flex gap-2">
									<button
										onClick={() => setUnit("in")}
										className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
											unit === "in"
												? "border-primary bg-primary text-primary-foreground"
												: "border-border hover:bg-muted"
										}`}
									>
										Inches
									</button>
									<button
										onClick={() => setUnit("cm")}
										className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
											unit === "cm"
												? "border-primary bg-primary text-primary-foreground"
												: "border-border hover:bg-muted"
										}`}
									>
										Centimeters
									</button>
								</div>
							</div>

							<div>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={compact}
										onChange={(e) => setCompact(e.target.checked)}
										className="rounded border-border"
									/>
									<span className="text-sm font-medium">Compact Mode</span>
								</label>
								<p className="mt-1 text-xs text-muted-foreground ml-6">
									Reduces padding for smaller spaces
								</p>
							</div>
						</div>

						{/* Generated Code */}
						<div className="mt-5 pt-5 border-t">
							<div className="flex items-center justify-between mb-2">
								<h4 className="text-sm font-semibold">Embed Code</h4>
								<button
									onClick={copyToClipboard}
									className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
									{copied ? "Copied!" : "Copy"}
								</button>
							</div>
							<pre className="rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
								<code>{embedCode}</code>
							</pre>
						</div>
					</div>

					{/* Preview Panel */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-semibold">Preview</h3>
							<button
								onClick={refreshPreview}
								className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								<RefreshCw className="h-3 w-3" />
								Refresh
							</button>
						</div>

						<div
							className={`rounded-xl border p-6 ${
								theme === "dark"
									? "border-zinc-800 bg-zinc-900"
									: "border-zinc-200 bg-white"
							}`}
						>
							<div
								key={previewKey}
								data-chart={chartSlug}
								data-theme={theme}
								data-unit={unit}
								data-compact={compact ? "true" : undefined}
							></div>
						</div>
					</div>
				</div>
			</section>

			{/* Configuration Options Reference */}
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
SizeCharts.setApiUrl("https://www.sizecharts.dev");`}
					</pre>
				</div>
			</section>

			{/* Example Links */}
			<section className="mb-8">
				<h2 className="text-lg font-semibold mb-4">More Examples</h2>
				<div className="grid gap-4 md:grid-cols-2">
					<a
						href="/examples/embed"
						className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors flex items-center gap-3"
					>
						<ExternalLink className="h-5 w-5 text-muted-foreground" />
						<div>
							<div className="font-medium">Pre-configured Examples</div>
							<div className="text-sm text-muted-foreground">Light, dark, and compact themes</div>
						</div>
					</a>
					<a
						href="/examples/example.html"
						target="_blank"
						className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors flex items-center gap-3"
					>
						<ExternalLink className="h-5 w-5 text-muted-foreground" />
						<div>
							<div className="font-medium">Standalone HTML Example</div>
							<div className="text-sm text-muted-foreground">External embed example file</div>
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
