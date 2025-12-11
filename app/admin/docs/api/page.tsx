"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

interface EndpointProps {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	description: string;
	params?: { name: string; type: string; required?: boolean; description: string }[];
	requestBody?: string;
	response?: string;
	example?: { request?: string; response: string };
}

function Endpoint({ method, path, description, params, requestBody, response, example }: EndpointProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const methodColors = {
		GET: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
		POST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
		PUT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
		DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="rounded-lg border bg-card">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/50"
			>
				{isOpen ? (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronRight className="h-4 w-4 text-muted-foreground" />
				)}
				<span className={`rounded px-2 py-0.5 text-xs font-semibold ${methodColors[method]}`}>
					{method}
				</span>
				<code className="flex-1 text-sm">{path}</code>
				<span className="text-sm text-muted-foreground">{description}</span>
			</button>

			{isOpen && (
				<div className="border-t px-4 py-4 space-y-4">
					{params && params.length > 0 && (
						<div>
							<h4 className="mb-2 text-sm font-semibold">Query Parameters</h4>
							<div className="rounded border">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b bg-muted/50">
											<th className="px-3 py-2 text-left font-medium">Name</th>
											<th className="px-3 py-2 text-left font-medium">Type</th>
											<th className="px-3 py-2 text-left font-medium">Required</th>
											<th className="px-3 py-2 text-left font-medium">Description</th>
										</tr>
									</thead>
									<tbody>
										{params.map((param) => (
											<tr key={param.name} className="border-b last:border-0">
												<td className="px-3 py-2">
													<code className="text-xs bg-muted px-1 py-0.5 rounded">{param.name}</code>
												</td>
												<td className="px-3 py-2 text-muted-foreground">{param.type}</td>
												<td className="px-3 py-2">
													{param.required ? (
														<Badge variant="default" className="text-xs">Required</Badge>
													) : (
														<span className="text-muted-foreground">Optional</span>
													)}
												</td>
												<td className="px-3 py-2 text-muted-foreground">{param.description}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{requestBody && (
						<div>
							<h4 className="mb-2 text-sm font-semibold">Request Body</h4>
							<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
								{requestBody}
							</pre>
						</div>
					)}

					{response && (
						<div>
							<h4 className="mb-2 text-sm font-semibold">Response Schema</h4>
							<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
								{response}
							</pre>
						</div>
					)}

					{example && (
						<div>
							<div className="flex items-center justify-between mb-2">
								<h4 className="text-sm font-semibold">Example</h4>
								<button
									onClick={() => copyToClipboard(example.response)}
									className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
								>
									{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
									{copied ? "Copied!" : "Copy response"}
								</button>
							</div>
							{example.request && (
								<div className="mb-2">
									<span className="text-xs text-muted-foreground">Request:</span>
									<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto mt-1">
										{example.request}
									</pre>
								</div>
							)}
							<div>
								<span className="text-xs text-muted-foreground">Response:</span>
								<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto mt-1">
									{example.response}
								</pre>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function ApiDocsPage() {
	const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

	return (
		<div className="max-w-4xl">
			<div className="mb-8">
				<h1 className="text-2xl font-bold">API Documentation</h1>
				<p className="mt-2 text-muted-foreground">
					Use these endpoints to integrate size charts into your application.
				</p>
			</div>

			{/* Base URL */}
			<div className="mb-8 rounded-lg border bg-card p-4">
				<h2 className="mb-2 font-semibold">Base URL</h2>
				<code className="rounded bg-muted px-2 py-1 text-sm">{baseUrl}/api/v1</code>
				<p className="mt-2 text-sm text-muted-foreground">
					All v1 API endpoints are prefixed with <code className="bg-muted px-1 rounded">/api/v1</code>
				</p>
			</div>

			{/* Authentication */}
			<div className="mb-8 rounded-lg border bg-card p-4">
				<h2 className="mb-2 font-semibold">Authentication</h2>
				<p className="text-sm text-muted-foreground mb-3">
					API requests require an API key. Keys can be created in the admin panel and have configurable scopes.
				</p>

				<div className="space-y-3">
					<div>
						<h3 className="text-sm font-medium mb-1">Header Authentication</h3>
						<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
							{`curl -H "X-API-Key: your_api_key_here" \\
  ${baseUrl}/api/v1/size-charts`}
						</pre>
					</div>

					<div>
						<h3 className="text-sm font-medium mb-1">Bearer Token</h3>
						<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
							{`curl -H "Authorization: Bearer your_api_key_here" \\
  ${baseUrl}/api/v1/size-charts`}
						</pre>
					</div>

					<div className="rounded border bg-amber-500/5 border-amber-500/20 p-3">
						<p className="text-sm"><strong>Scopes:</strong></p>
						<ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
							<li><code className="bg-muted px-1 rounded">read</code> - Access to GET endpoints</li>
							<li><code className="bg-muted px-1 rounded">write</code> - Access to POST, PUT, DELETE endpoints</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Quick Start */}
			<div className="mb-8 rounded-lg border bg-blue-500/5 border-blue-500/20 p-4">
				<h2 className="mb-2 font-semibold text-blue-600">Quick Start</h2>
				<p className="text-sm text-muted-foreground mb-3">
					Fetch a size chart by its slug (unique identifier):
				</p>
				<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
					{`curl "${baseUrl}/api/v1/size-charts?slug=mens-tops"

# Or fetch all charts for a category
curl "${baseUrl}/api/v1/size-charts?category=mens&subcategory=tops"`}
				</pre>
			</div>

			{/* Size Charts Endpoints */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold">Size Charts</h2>
				<div className="space-y-3">
					<Endpoint
						method="GET"
						path="/api/v1/size-charts"
						description="List or fetch size charts"
						params={[
							{ name: "id", type: "string", description: "Fetch a specific chart by ID" },
							{ name: "slug", type: "string", description: "Fetch a specific chart by slug (URL-friendly ID)" },
							{ name: "category", type: "string", description: "Filter by category slug (e.g., 'mens', 'womens')" },
							{ name: "subcategory", type: "string", description: "Filter by subcategory slug (requires category)" },
							{ name: "includeUnpublished", type: "boolean", description: "Include draft charts (default: false)" },
						]}
						response={`{
  "id": "cuid...",
  "name": "Tops",
  "slug": "mens-tops",
  "description": "Men's tops size guide",
  "isPublished": true,
  "categories": [
    {
      "category": "mens",
      "categoryName": "Men's",
      "subcategory": "tops",
      "subcategoryName": "Tops"
    }
  ],
  "columns": [
    { "id": "...", "name": "Size", "type": "SIZE_LABEL" },
    { "id": "...", "name": "Chest", "type": "MEASUREMENT" }
  ],
  "rows": [
    {
      "id": "...",
      "cells": [
        { "columnId": "...", "type": "text", "value": "SM" },
        { "columnId": "...", "type": "range", "inches": { "min": 34, "max": 37 }, "cm": { "min": 86.4, "max": 94 } }
      ]
    }
  ],
  "meta": {
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}`}
						example={{
							request: `GET /api/v1/size-charts?slug=mens-tops`,
							response: `{
  "id": "cmj0j8dh0002hb9xk...",
  "name": "Tops",
  "slug": "mens-tops",
  "categories": [{ "category": "mens", "subcategory": "tops" }],
  "columns": [
    { "id": "...", "name": "Size", "type": "SIZE_LABEL" },
    { "id": "...", "name": "Chest", "type": "MEASUREMENT" },
    { "id": "...", "name": "Waist", "type": "MEASUREMENT" }
  ],
  "rows": [
    {
      "cells": [
        { "type": "text", "value": "XS" },
        { "type": "range", "inches": { "min": 31, "max": 34 }, "cm": { "min": 78.7, "max": 86.4 } },
        { "type": "range", "inches": { "min": 28, "max": 29 }, "cm": { "min": 71.1, "max": 73.7 } }
      ]
    }
  ]
}`
						}}
					/>
				</div>
			</div>

			{/* Categories Endpoints */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold">Categories</h2>
				<div className="space-y-3">
					<Endpoint
						method="GET"
						path="/api/v1/categories"
						description="Get category tree with chart counts"
						response={`[
  {
    "slug": "mens",
    "name": "Men's",
    "subcategories": [
      { "slug": "tops", "name": "Tops", "chartCount": 1 },
      { "slug": "bottoms", "name": "Bottoms", "chartCount": 1 }
    ]
  },
  {
    "slug": "womens",
    "name": "Women's",
    "subcategories": [...]
  }
]`}
						example={{
							response: `[
  {
    "slug": "mens",
    "name": "Men's",
    "subcategories": [
      { "slug": "tops", "name": "Tops", "chartCount": 1 },
      { "slug": "bottoms", "name": "Bottoms", "chartCount": 1 },
      { "slug": "footwear", "name": "Footwear", "chartCount": 1 }
    ]
  }
]`
						}}
					/>
				</div>
			</div>

			{/* Labels Endpoints */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold">Labels</h2>
				<div className="space-y-3">
					<Endpoint
						method="GET"
						path="/api/v1/labels"
						description="Get size labels grouped by type"
						params={[
							{ name: "type", type: "string", description: "Filter by label type (e.g., 'ALPHA_SIZE', 'NUMERIC_SIZE')" },
						]}
						response={`{
  "ALPHA_SIZE": [
    { "key": "SIZE_XXS", "value": "XXS", "sortOrder": 0 },
    { "key": "SIZE_XS", "value": "XS", "sortOrder": 1 },
    { "key": "SIZE_SM", "value": "SM", "sortOrder": 2 }
  ],
  "NUMERIC_SIZE": [
    { "key": "SIZE_0", "value": "0", "sortOrder": 0 },
    { "key": "SIZE_2", "value": "2", "sortOrder": 1 }
  ]
}`}
					/>
				</div>
			</div>

			{/* Cell Types Reference */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold">Cell Types Reference</h2>
				<div className="rounded-lg border bg-card overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="px-4 py-3 text-left font-medium">Type</th>
								<th className="px-4 py-3 text-left font-medium">Description</th>
								<th className="px-4 py-3 text-left font-medium">Fields</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded">text</code></td>
								<td className="px-4 py-3 text-muted-foreground">Plain text value</td>
								<td className="px-4 py-3"><code className="text-xs">value: string</code></td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded">single</code></td>
								<td className="px-4 py-3 text-muted-foreground">Single measurement value</td>
								<td className="px-4 py-3"><code className="text-xs">inches: number, cm: number</code></td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded">range</code></td>
								<td className="px-4 py-3 text-muted-foreground">Measurement range (min-max)</td>
								<td className="px-4 py-3"><code className="text-xs">inches: {"{min, max}"}, cm: {"{min, max}"}</code></td>
							</tr>
							<tr>
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded">label</code></td>
								<td className="px-4 py-3 text-muted-foreground">Linked to a SizeLabel</td>
								<td className="px-4 py-3"><code className="text-xs">key: string, value: string, labelType: string</code></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Label Types Reference */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold">Label Types Reference</h2>
				<div className="rounded-lg border bg-card overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="px-4 py-3 text-left font-medium">Type</th>
								<th className="px-4 py-3 text-left font-medium">Description</th>
								<th className="px-4 py-3 text-left font-medium">Examples</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded text-xs">ALPHA_SIZE</code></td>
								<td className="px-4 py-3 text-muted-foreground">Letter sizes</td>
								<td className="px-4 py-3">XS, S, M, L, XL, XXL</td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded text-xs">NUMERIC_SIZE</code></td>
								<td className="px-4 py-3 text-muted-foreground">Number sizes</td>
								<td className="px-4 py-3">0, 2, 4, 6, 8, 10</td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded text-xs">YOUTH_SIZE</code></td>
								<td className="px-4 py-3 text-muted-foreground">Youth/Kids sizes</td>
								<td className="px-4 py-3">YXS, YS, YM, YL, YXL</td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded text-xs">BAND_SIZE</code></td>
								<td className="px-4 py-3 text-muted-foreground">Bra band sizes</td>
								<td className="px-4 py-3">30, 32, 34, 36, 38</td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded text-xs">CUP_SIZE</code></td>
								<td className="px-4 py-3 text-muted-foreground">Bra cup sizes</td>
								<td className="px-4 py-3">A, B, C, D, DD</td>
							</tr>
							<tr>
								<td className="px-4 py-3"><code className="bg-muted px-1 rounded text-xs">CUSTOM</code></td>
								<td className="px-4 py-3 text-muted-foreground">User-defined</td>
								<td className="px-4 py-3">Any custom labels</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Integration Examples */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold">Integration Examples</h2>

				<div className="space-y-4">
					<div className="rounded-lg border bg-card p-4">
						<h3 className="mb-2 font-medium">JavaScript / TypeScript</h3>
						<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
							{`// Fetch a size chart
const response = await fetch('${baseUrl}/api/v1/size-charts?slug=mens-tops');
const chart = await response.json();

// Display the data
chart.rows.forEach(row => {
  row.cells.forEach(cell => {
    if (cell.type === 'range') {
      console.log(\`\${cell.inches.min}" - \${cell.inches.max}"\`);
      console.log(\`\${cell.cm.min} - \${cell.cm.max} cm\`);
    } else {
      console.log(cell.value);
    }
  });
});`}
						</pre>
					</div>

					{/* React Component with Live Preview */}
					<div className="rounded-lg border bg-card overflow-hidden">
						<div className="border-b bg-muted/50 px-4 py-3">
							<h3 className="font-medium">React Component with Live Preview</h3>
						</div>
						<div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
							{/* Code */}
							<div className="p-4">
								<p className="text-xs text-muted-foreground mb-2">Code</p>
								<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
									{`function SizeChart({ slug, unit = 'inches' }) {
  const [chart, setChart] = useState(null);

  useEffect(() => {
    fetch(\`/api/v1/size-charts?slug=\${slug}\`)
      .then(res => res.json())
      .then(setChart);
  }, [slug]);

  if (!chart) return <Skeleton />;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-muted/50">
          {chart.columns.map(col => (
            <th key={col.id} className="px-3 py-2 text-left">
              {col.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {chart.rows.map(row => (
          <tr key={row.id} className="border-b">
            {row.cells.map((cell, i) => (
              <td key={i} className="px-3 py-2">
                {cell.type === 'range'
                  ? \`\${cell[unit].min} - \${cell[unit].max}\`
                  : cell.value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}`}
								</pre>
							</div>

							{/* Preview */}
							<div className="p-4">
								<p className="text-xs text-muted-foreground mb-2">Rendered Output</p>
								<div className="rounded border overflow-hidden">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b bg-muted/50">
												<th className="px-3 py-2 text-left font-medium">Size</th>
												<th className="px-3 py-2 text-left font-medium">Chest</th>
												<th className="px-3 py-2 text-left font-medium">Waist</th>
											</tr>
										</thead>
										<tbody>
											<tr className="border-b">
												<td className="px-3 py-2">XS</td>
												<td className="px-3 py-2">31&quot; - 34&quot;</td>
												<td className="px-3 py-2">28&quot; - 29&quot;</td>
											</tr>
											<tr className="border-b">
												<td className="px-3 py-2">SM</td>
												<td className="px-3 py-2">34&quot; - 37&quot;</td>
												<td className="px-3 py-2">29&quot; - 31&quot;</td>
											</tr>
											<tr className="border-b">
												<td className="px-3 py-2">MD</td>
												<td className="px-3 py-2">37&quot; - 40&quot;</td>
												<td className="px-3 py-2">31&quot; - 33&quot;</td>
											</tr>
											<tr>
												<td className="px-3 py-2">LG</td>
												<td className="px-3 py-2">40&quot; - 44&quot;</td>
												<td className="px-3 py-2">33&quot; - 35&quot;</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Using Labels for Translation */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold">Using Labels for Translation</h2>
				<div className="rounded-lg border bg-amber-500/5 border-amber-500/20 p-4 mb-4">
					<p className="text-sm text-muted-foreground">
						Size labels use standardized keys (e.g., <code className="bg-muted px-1 rounded">SIZE_SM</code>)
						that you can use for translation in your application. The API returns both the key and the
						default display value, along with measurements in both inches and centimeters.
					</p>
				</div>

				<div className="space-y-4">
					<div className="rounded-lg border bg-card p-4">
						<h3 className="mb-2 font-medium">Translation Config with Default Unit</h3>
						<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
							{`// Define locale configuration with translations and default measurement unit
const localeConfig = {
  'en-US': {
    defaultUnit: 'inches',  // US typically uses inches
    labels: {
      SIZE_XXS: 'XXS',
      SIZE_XS: 'XS',
      SIZE_SM: 'S',
      SIZE_MD: 'M',
      SIZE_LG: 'L',
      SIZE_XL: 'XL',
      SIZE_XXL: 'XXL',
    },
  },
  'fr-CA': {
    defaultUnit: 'cm',  // Canada uses metric
    labels: {
      SIZE_XXS: 'TTP',  // Très très petit
      SIZE_XS: 'TP',    // Très petit
      SIZE_SM: 'P',     // Petit
      SIZE_MD: 'M',     // Moyen
      SIZE_LG: 'G',     // Grand
      SIZE_XL: 'TG',    // Très grand
      SIZE_XXL: 'TTG',  // Très très grand
    },
  },
  'en-GB': {
    defaultUnit: 'cm',  // UK uses metric for clothing
    labels: {
      SIZE_XXS: 'XXS',
      SIZE_XS: 'XS',
      SIZE_SM: 'S',
      SIZE_MD: 'M',
      SIZE_LG: 'L',
      SIZE_XL: 'XL',
      SIZE_XXL: 'XXL',
    },
  },
  'es-ES': {
    defaultUnit: 'cm',  // Europe uses metric
    labels: {
      SIZE_XXS: 'XXP',
      SIZE_XS: 'XP',
      SIZE_SM: 'P',
      SIZE_MD: 'M',
      SIZE_LG: 'G',
      SIZE_XL: 'XG',
      SIZE_XXL: 'XXG',
    },
  },
};`}
						</pre>
					</div>

					<div className="rounded-lg border bg-card p-4">
						<h3 className="mb-2 font-medium">React Hook with Unit Preference</h3>
						<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
							{`// Hook that provides both translation and unit formatting
function useLocalization(locale) {
  const config = localeConfig[locale] || localeConfig['en-US'];

  // Translate a label key
  const t = useCallback((key, fallback) => {
    return config.labels?.[key] || fallback || key;
  }, [config]);

  // Format a measurement cell based on locale default unit
  const formatMeasurement = useCallback((cell, overrideUnit) => {
    const unit = overrideUnit || config.defaultUnit;

    if (cell.type === 'single') {
      const value = cell[unit];
      return unit === 'inches' ? \`\${value}"\` : \`\${value} cm\`;
    }

    if (cell.type === 'range') {
      const { min, max } = cell[unit];
      return unit === 'inches'
        ? \`\${min}" - \${max}"\`
        : \`\${min} - \${max} cm\`;
    }

    return cell.value;
  }, [config]);

  return { t, formatMeasurement, defaultUnit: config.defaultUnit };
}

// Usage in component
function SizeChartCell({ cell, locale }) {
  const { t, formatMeasurement } = useLocalization(locale);

  if (cell.type === 'label') {
    return <td>{t(cell.key, cell.value)}</td>;
  }

  return <td>{formatMeasurement(cell)}</td>;
}`}
						</pre>
					</div>

					<div className="rounded-lg border bg-card p-4">
						<h3 className="mb-2 font-medium">User Override with localStorage</h3>
						<pre className="rounded bg-zinc-950 p-3 text-xs text-zinc-100 overflow-x-auto">
							{`// Allow users to override the default unit preference
function useUnitPreference(locale) {
  const config = localeConfig[locale] || localeConfig['en-US'];

  // Check localStorage for user preference, fallback to locale default
  const [unit, setUnit] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('unitPreference') || config.defaultUnit;
    }
    return config.defaultUnit;
  });

  // Persist preference
  const updateUnit = useCallback((newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('unitPreference', newUnit);
  }, []);

  return { unit, setUnit: updateUnit, localeDefault: config.defaultUnit };
}

// Unit switcher component
function UnitSwitcher({ locale }) {
  const { unit, setUnit, localeDefault } = useUnitPreference(locale);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setUnit('inches')}
        className={unit === 'inches' ? 'active' : ''}
      >
        Inches
      </button>
      <button
        onClick={() => setUnit('cm')}
        className={unit === 'cm' ? 'active' : ''}
      >
        CM
      </button>
      {unit !== localeDefault && (
        <button onClick={() => setUnit(localeDefault)}>
          Reset to default
        </button>
      )}
    </div>
  );
}`}
						</pre>
					</div>

					<div className="rounded-lg border bg-card overflow-hidden">
						<div className="border-b bg-muted/50 px-4 py-3">
							<h3 className="font-medium">Translation Example with Default Units</h3>
							<p className="text-xs text-muted-foreground mt-1">
								Each locale has a default unit preference that can be overridden by users
							</p>
						</div>
						<div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
							<div className="p-4">
								<div className="flex items-center justify-between mb-2">
									<p className="text-xs text-muted-foreground">English (en-US)</p>
									<Badge variant="secondary" className="text-xs">Default: Inches</Badge>
								</div>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between"><span>XS</span><span className="text-muted-foreground">31&quot; - 34&quot;</span></div>
									<div className="flex justify-between"><span>S</span><span className="text-muted-foreground">34&quot; - 37&quot;</span></div>
									<div className="flex justify-between"><span>M</span><span className="text-muted-foreground">37&quot; - 40&quot;</span></div>
									<div className="flex justify-between"><span>L</span><span className="text-muted-foreground">40&quot; - 44&quot;</span></div>
								</div>
							</div>
							<div className="p-4">
								<div className="flex items-center justify-between mb-2">
									<p className="text-xs text-muted-foreground">French Canada (fr-CA)</p>
									<Badge variant="secondary" className="text-xs">Default: CM</Badge>
								</div>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between"><span>TP</span><span className="text-muted-foreground">79 - 86 cm</span></div>
									<div className="flex justify-between"><span>P</span><span className="text-muted-foreground">86 - 94 cm</span></div>
									<div className="flex justify-between"><span>M</span><span className="text-muted-foreground">94 - 102 cm</span></div>
									<div className="flex justify-between"><span>G</span><span className="text-muted-foreground">102 - 112 cm</span></div>
								</div>
							</div>
							<div className="p-4">
								<div className="flex items-center justify-between mb-2">
									<p className="text-xs text-muted-foreground">UK English (en-GB)</p>
									<Badge variant="secondary" className="text-xs">Default: CM</Badge>
								</div>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between"><span>XS</span><span className="text-muted-foreground">79 - 86 cm</span></div>
									<div className="flex justify-between"><span>S</span><span className="text-muted-foreground">86 - 94 cm</span></div>
									<div className="flex justify-between"><span>M</span><span className="text-muted-foreground">94 - 102 cm</span></div>
									<div className="flex justify-between"><span>L</span><span className="text-muted-foreground">102 - 112 cm</span></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Error Handling */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold">Error Handling</h2>
				<div className="rounded-lg border bg-card overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="px-4 py-3 text-left font-medium">Status Code</th>
								<th className="px-4 py-3 text-left font-medium">Meaning</th>
								<th className="px-4 py-3 text-left font-medium">Response</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-emerald-500/10 text-emerald-600 px-1 rounded">200</code></td>
								<td className="px-4 py-3 text-muted-foreground">Success</td>
								<td className="px-4 py-3">Requested data</td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-amber-500/10 text-amber-600 px-1 rounded">401</code></td>
								<td className="px-4 py-3 text-muted-foreground">Unauthorized</td>
								<td className="px-4 py-3"><code className="text-xs">{`{ "error": "API key required" }`}</code></td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-amber-500/10 text-amber-600 px-1 rounded">403</code></td>
								<td className="px-4 py-3 text-muted-foreground">Forbidden</td>
								<td className="px-4 py-3"><code className="text-xs">{`{ "error": "Insufficient permissions" }`}</code></td>
							</tr>
							<tr className="border-b">
								<td className="px-4 py-3"><code className="bg-amber-500/10 text-amber-600 px-1 rounded">404</code></td>
								<td className="px-4 py-3 text-muted-foreground">Not Found</td>
								<td className="px-4 py-3"><code className="text-xs">{`{ "error": "Size chart not found" }`}</code></td>
							</tr>
							<tr>
								<td className="px-4 py-3"><code className="bg-red-500/10 text-red-600 px-1 rounded">500</code></td>
								<td className="px-4 py-3 text-muted-foreground">Server Error</td>
								<td className="px-4 py-3"><code className="text-xs">{`{ "error": "Internal server error" }`}</code></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
