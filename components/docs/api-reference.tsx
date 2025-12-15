"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

// Section navigation data
const sections = [
	{ id: "authentication", label: "Authentication" },
	{ id: "base-url", label: "Base URL" },
	{ id: "size-charts", label: "Size Charts" },
	{ id: "categories", label: "Categories" },
	{ id: "labels", label: "Labels" },
	{ id: "error-handling", label: "Error Handling" },
	{ id: "rate-limiting", label: "Rate Limiting" },
];

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
		GET: "bg-[oklch(0.65_0.20_160)]/15 text-[oklch(0.45_0.18_160)] dark:text-[oklch(0.75_0.16_160)] border-[oklch(0.65_0.20_160)]/20",
		POST: "bg-primary/10 text-primary border-primary/20",
		PUT: "bg-accent/10 text-accent border-accent/20",
		DELETE: "bg-destructive/10 text-destructive border-destructive/20",
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="rounded-xl border border-border bg-card overflow-hidden">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
			>
				{isOpen ? (
					<ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
				) : (
					<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
				)}
				<span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${methodColors[method]}`}>
					{method}
				</span>
				<code className="flex-1 text-sm font-mono text-foreground">{path}</code>
				<span className="text-sm text-muted-foreground hidden sm:inline">{description}</span>
			</button>

			{isOpen && (
				<div className="border-t border-border bg-muted/20 px-4 py-4 space-y-4">
					<p className="text-sm text-muted-foreground sm:hidden">{description}</p>

					{params && params.length > 0 && (
						<div>
							<h4 className="mb-2 text-sm font-semibold text-foreground">Query Parameters</h4>
							<div className="rounded-lg border border-border overflow-x-auto bg-card">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b border-border bg-muted/50">
											<th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
											<th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
											<th className="px-3 py-2 text-left font-medium text-muted-foreground">Required</th>
											<th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th>
										</tr>
									</thead>
									<tbody>
										{params.map((param) => (
											<tr key={param.name} className="border-b border-border last:border-0">
												<td className="px-3 py-2">
													<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{param.name}</code>
												</td>
												<td className="px-3 py-2 text-muted-foreground">{param.type}</td>
												<td className="px-3 py-2">
													{param.required ? (
														<Badge variant="default" className="text-xs">Required</Badge>
													) : (
														<span className="text-muted-foreground text-xs">Optional</span>
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
							<h4 className="mb-2 text-sm font-semibold text-foreground">Request Body</h4>
							<pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-x-auto">
								<code className="font-mono text-foreground">{requestBody}</code>
							</pre>
						</div>
					)}

					{response && (
						<div>
							<h4 className="mb-2 text-sm font-semibold text-foreground">Response</h4>
							<pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-x-auto">
								<code className="font-mono text-foreground">{response}</code>
							</pre>
						</div>
					)}

					{example && (
						<div>
							<div className="flex items-center justify-between mb-2">
								<h4 className="text-sm font-semibold text-foreground">Example</h4>
								<button
									onClick={() => copyToClipboard(example.request || example.response)}
									className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
								>
									{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
									{copied ? "Copied!" : "Copy"}
								</button>
							</div>
							{example.request && (
								<pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-x-auto mb-2">
									<code className="font-mono text-foreground">{example.request}</code>
								</pre>
							)}
							<pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-x-auto">
								<code className="font-mono text-foreground">{example.response}</code>
							</pre>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// Section navigation component
function SectionNav({ activeSection }: { activeSection: string }) {
	return (
		<nav className="space-y-1">
			<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
				On this page
			</p>
			{sections.map((section) => (
				<a
					key={section.id}
					href={`#${section.id}`}
					className={`block text-sm py-1.5 pl-3 border-l-2 transition-colors ${activeSection === section.id
							? "border-primary text-primary font-medium"
							: "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
						}`}
				>
					{section.label}
				</a>
			))}
		</nav>
	);
}

// API endpoint data
const sizeChartsEndpoints: EndpointProps[] = [
	{
		method: "GET",
		path: "/api/v1/size-charts",
		description: "List or get size charts",
		params: [
			{ name: "slug", type: "string", description: "Get single chart by slug" },
			{ name: "category", type: "string", description: "Filter by category slug" },
			{ name: "subcategory", type: "string", description: "Filter by subcategory slug" },
		],
		example: {
			request: `curl -H "X-API-Key: sc_xxxx" \\
  "https://www.sizecharts.dev/api/v1/size-charts?slug=mens-tops"`,
			response: `{
  "id": "abc123",
  "name": "Tops",
  "slug": "mens-tops",
  "isPublished": true,
  "categories": [
    { "category": "mens", "subcategory": "tops" }
  ],
  "columns": [
    { "id": "col1", "name": "Size", "type": "SIZE_LABEL" },
    { "id": "col2", "name": "Chest", "type": "MEASUREMENT" }
  ],
  "rows": [
    {
      "id": "row1",
      "cells": [
        { "columnId": "col1", "type": "text", "value": "SM" },
        { "columnId": "col2", "type": "range",
          "inches": { "min": 34, "max": 37 },
          "cm": { "min": 86.4, "max": 94 }
        }
      ]
    }
  ]
}`
		}
	},
];

const categoriesEndpoints: EndpointProps[] = [
	{
		method: "GET",
		path: "/api/v1/categories",
		description: "Get category tree",
		example: {
			request: `curl -H "X-API-Key: sc_xxxx" "https://www.sizecharts.dev/api/v1/categories"`,
			response: `[
  {
    "id": "cat1",
    "name": "Men's",
    "slug": "mens",
    "subcategories": [
      { "id": "sub1", "name": "Tops", "slug": "tops" },
      { "id": "sub2", "name": "Bottoms", "slug": "bottoms" }
    ]
  }
]`
		}
	},
];

const labelsEndpoints: EndpointProps[] = [
	{
		method: "GET",
		path: "/api/v1/labels",
		description: "Get all size labels",
		params: [
			{ name: "type", type: "string", description: "Filter by label type (ALPHA_SIZE, NUMERIC_SIZE, etc.)" },
		],
		example: {
			request: `curl -H "X-API-Key: sc_xxxx" "https://www.sizecharts.dev/api/v1/labels"`,
			response: `[
  {
    "key": "SIZE_SM",
    "displayValue": "SM",
    "labelType": "ALPHA_SIZE",
    "sortOrder": 1
  }
]`
		}
	},
];

interface ApiReferenceContentProps {
	showTitle?: boolean;
	showNavigation?: boolean;
	className?: string;
}

export function ApiReferenceContent({
	showTitle = true,
	showNavigation = true,
	className = ""
}: ApiReferenceContentProps) {
	const [activeSection, setActiveSection] = useState("authentication");
	const contentRef = useRef<HTMLDivElement>(null);

	// Intersection observer to track active section
	useEffect(() => {
		if (!showNavigation) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				});
			},
			{ rootMargin: "-20% 0px -70% 0px" }
		);

		sections.forEach((section) => {
			const element = document.getElementById(section.id);
			if (element) observer.observe(element);
		});

		return () => observer.disconnect();
	}, [showNavigation]);

	const content = (
		<div ref={contentRef} className={showNavigation ? "lg:pr-8" : ""}>
			{showTitle && (
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-foreground">API Reference</h1>
					<p className="mt-2 text-muted-foreground">
						Complete documentation for the Size Charts v1 API.
					</p>
				</div>
			)}

			{/* Authentication */}
			<section id="authentication" className="mb-10 scroll-mt-20">
				<h2 className="text-lg font-semibold text-foreground mb-4">Authentication</h2>
				<div className="rounded-xl border border-border bg-card p-5">
					<p className="text-sm text-muted-foreground mb-4">
						All API requests require authentication via API key. Include the key in request headers:
					</p>
					<pre className="rounded-lg border border-border bg-muted/50 p-4 text-xs overflow-x-auto">
						<code className="font-mono text-foreground">{`# Option 1: X-API-Key header
curl -H "X-API-Key: sc_live_xxxxxxxxxxxx" ...

# Option 2: Authorization header
curl -H "Authorization: Bearer sc_live_xxxxxxxxxxxx" ...`}</code>
					</pre>
					<p className="text-sm text-muted-foreground mt-4">
						Generate API keys in the admin panel under <span className="text-foreground font-medium">API Keys</span>.
					</p>
				</div>
			</section>

			{/* Base URL */}
			<section id="base-url" className="mb-10 scroll-mt-20">
				<h2 className="text-lg font-semibold text-foreground mb-4">Base URL</h2>
				<div className="rounded-xl border border-border bg-muted/30 p-4">
					<code className="text-sm font-mono text-foreground">https://www.sizecharts.dev/api/v1</code>
				</div>
			</section>

			{/* Size Charts */}
			<section id="size-charts" className="mb-10 scroll-mt-20">
				<h2 className="text-lg font-semibold text-foreground mb-4">Size Charts</h2>
				<div className="space-y-3">
					{sizeChartsEndpoints.map((endpoint, i) => (
						<Endpoint key={i} {...endpoint} />
					))}
				</div>
			</section>

			{/* Categories */}
			<section id="categories" className="mb-10 scroll-mt-20">
				<h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
				<div className="space-y-3">
					{categoriesEndpoints.map((endpoint, i) => (
						<Endpoint key={i} {...endpoint} />
					))}
				</div>
			</section>

			{/* Labels */}
			<section id="labels" className="mb-10 scroll-mt-20">
				<h2 className="text-lg font-semibold text-foreground mb-4">Labels</h2>
				<div className="space-y-3">
					{labelsEndpoints.map((endpoint, i) => (
						<Endpoint key={i} {...endpoint} />
					))}
				</div>
			</section>

			{/* Error Handling */}
			<section id="error-handling" className="mb-10 scroll-mt-20">
				<h2 className="text-lg font-semibold text-foreground mb-4">Error Handling</h2>
				<div className="rounded-xl border border-border bg-card overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/50">
								<th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
								<th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
							</tr>
						</thead>
						<tbody>
							{[
								{ code: "200", desc: "Success", color: "bg-[oklch(0.65_0.20_160)]/15 text-[oklch(0.45_0.18_160)] dark:text-[oklch(0.75_0.16_160)]" },
								{ code: "400", desc: "Bad request - invalid parameters", color: "bg-[oklch(0.75_0.15_85)]/15 text-[oklch(0.50_0.12_85)] dark:text-[oklch(0.80_0.12_85)]" },
								{ code: "401", desc: "Unauthorized - API key required", color: "bg-[oklch(0.75_0.15_85)]/15 text-[oklch(0.50_0.12_85)] dark:text-[oklch(0.80_0.12_85)]" },
								{ code: "403", desc: "Forbidden - insufficient permissions", color: "bg-[oklch(0.75_0.15_85)]/15 text-[oklch(0.50_0.12_85)] dark:text-[oklch(0.80_0.12_85)]" },
								{ code: "404", desc: "Not found", color: "bg-[oklch(0.75_0.15_85)]/15 text-[oklch(0.50_0.12_85)] dark:text-[oklch(0.80_0.12_85)]" },
								{ code: "429", desc: "Rate limit exceeded (100 req/min)", color: "bg-[oklch(0.70_0.18_55)]/15 text-[oklch(0.50_0.15_55)] dark:text-[oklch(0.80_0.15_55)]" },
								{ code: "500", desc: "Server error", color: "bg-destructive/15 text-destructive" },
							].map((error, i) => (
								<tr key={error.code} className={i < 6 ? "border-b border-border" : ""}>
									<td className="px-4 py-3">
										<code className={`text-xs px-2 py-1 rounded font-mono font-semibold ${error.color}`}>{error.code}</code>
									</td>
									<td className="px-4 py-3 text-muted-foreground">{error.desc}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{/* Rate Limiting */}
			<section id="rate-limiting" className="mb-10 scroll-mt-20">
				<h2 className="text-lg font-semibold text-foreground mb-4">Rate Limiting</h2>
				<div className="rounded-xl border border-border bg-card p-5">
					<p className="text-sm text-muted-foreground mb-4">
						API requests are rate limited per API key:
					</p>
					<ul className="text-sm space-y-2 mb-4">
						<li className="flex items-center gap-2">
							<span className="h-1.5 w-1.5 rounded-full bg-primary" />
							<span><span className="font-medium text-foreground">Read operations:</span> <span className="text-muted-foreground">100 requests per minute</span></span>
						</li>
						<li className="flex items-center gap-2">
							<span className="h-1.5 w-1.5 rounded-full bg-primary" />
							<span><span className="font-medium text-foreground">Write operations:</span> <span className="text-muted-foreground">30 requests per minute</span></span>
						</li>
					</ul>
					<p className="text-sm text-muted-foreground mb-3">
						Rate limit headers are included in all responses:
					</p>
					<pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-x-auto">
						<code className="font-mono text-foreground">{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702407600`}</code>
					</pre>
				</div>
			</section>
		</div>
	);

	if (!showNavigation) {
		return <div className={className}>{content}</div>;
	}

	return (
		<div className={`flex items-start gap-8 ${className}`}>
			{/* Main content */}
			<div className="flex-1 min-w-0">
				{content}
			</div>

			{/* Right sidebar navigation - sticky below navbar */}
			<aside className="hidden lg:block w-48 flex-shrink-0 sticky top-24 self-start">
				<SectionNav activeSection={activeSection} />
			</aside>
		</div>
	);
}

export { Endpoint };
export type { EndpointProps };
