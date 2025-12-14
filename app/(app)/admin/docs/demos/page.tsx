"use client";

import Link from "next/link";
import { Code2, Wand2, ExternalLink, ArrowRight } from "lucide-react";

const demos = [
	{
		href: "/admin/docs/demos/embed",
		icon: Code2,
		title: "Embed Widget Examples",
		description: "Pre-configured widget examples showing light/dark themes, units, and compact mode.",
	},
	{
		href: "/admin/docs/demos/live",
		icon: Wand2,
		title: "Live Builder",
		description: "Interactive builder to configure and preview the widget with your settings.",
	},
	{
		href: "/demo/example.html",
		icon: ExternalLink,
		title: "Standalone HTML",
		description: "Plain HTML page demonstrating the embed widget - opens in new tab.",
		external: true,
	},
];

export default function AdminDemosPage() {
	return (
		<div className="max-w-4xl">
			<div className="mb-8">
				<h1 className="text-2xl font-bold">Demos</h1>
				<p className="mt-2 text-muted-foreground">
					Explore different ways to use the size chart widget.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{demos.map((demo) =>
					demo.external ? (
						<a
							key={demo.href}
							href={demo.href}
							target="_blank"
							rel="noopener noreferrer"
							className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
						>
							<demo.icon className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
							<h2 className="font-semibold mb-1">{demo.title}</h2>
							<p className="text-sm text-muted-foreground mb-4">
								{demo.description}
							</p>
							<span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
								Open
								<ExternalLink className="h-4 w-4" />
							</span>
						</a>
					) : (
						<Link
							key={demo.href}
							href={demo.href}
							className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
						>
							<demo.icon className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
							<h2 className="font-semibold mb-1">{demo.title}</h2>
							<p className="text-sm text-muted-foreground mb-4">
								{demo.description}
							</p>
							<span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
								View
								<ArrowRight className="h-4 w-4" />
							</span>
						</Link>
					)
				)}
			</div>

			<div className="mt-8 rounded-xl border border-border bg-muted/30 p-6">
				<h2 className="font-semibold mb-3">Quick Embed</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Add size charts to any website with just two lines of code:
				</p>
				<pre className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100 overflow-x-auto">
					<code>{`<div data-chart="mens-tops"></div>
<script src="https://www.sizecharts.dev/embed/size-charts.js" data-api="https://www.sizecharts.dev"></script>`}</code>
				</pre>
			</div>
		</div>
	);
}
