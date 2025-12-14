"use client";

import { CheckCircle2, Clock, HelpCircle } from "lucide-react";

interface ReleaseItemProps {
	title: string;
	items: string[];
}

function ReleaseItem({ title, items }: ReleaseItemProps) {
	return (
		<div className="pl-6 border-l-2 border-primary/20">
			<h3 className="font-medium text-foreground">{title}</h3>
			<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
				{items.map((item, i) => (
					<li key={i}>{item}</li>
				))}
			</ul>
		</div>
	);
}

interface ChangelogContentProps {
	showTitle?: boolean;
	className?: string;
}

export function ChangelogContent({ showTitle = true, className = "" }: ChangelogContentProps) {
	return (
		<div className={className}>
			{showTitle && (
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-foreground">Changelog</h1>
					<p className="mt-2 text-muted-foreground">
						Release history and upcoming features.
					</p>
				</div>
			)}

			{/* Current Version Banner */}
			<div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4">
				<div className="flex items-center gap-2 mb-1">
					<div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
					<span className="text-sm font-medium text-primary">v1.0 In Development</span>
				</div>
				<p className="text-sm text-muted-foreground">
					Embeddable widget and integration features.
				</p>
			</div>

			{/* v0.6.0 - Latest Stable */}
			<section className="mb-8">
				<div className="flex items-center gap-2 mb-4">
					<CheckCircle2 className="h-5 w-5 text-[oklch(0.65_0.20_160)]" />
					<h2 className="text-lg font-semibold text-foreground">v0.6.0</h2>
					<span className="text-sm text-muted-foreground">Production Ready</span>
				</div>
				<div className="space-y-4">
					<ReleaseItem
						title="Security & Authentication"
						items={[
							"Admin login with session management",
							"API key authentication with scopes",
							"Rate limiting (100 read / 30 write per minute)",
							"CORS configuration for cross-origin access",
						]}
					/>
					<ReleaseItem
						title="Data Management"
						items={[
							"Full CRUD API for charts, categories, and labels",
							"Many-to-many category relationships",
							"Reusable size labels (SM, MD, LG)",
							"Measurement instructions support",
						]}
					/>
					<ReleaseItem
						title="Infrastructure"
						items={[
							"Docker support with multi-stage builds",
							"Structured JSON logging",
						]}
					/>
				</div>
			</section>

			{/* v0.1.0 - Alpha */}
			<section className="mb-8">
				<div className="flex items-center gap-2 mb-4">
					<CheckCircle2 className="h-5 w-5 text-[oklch(0.65_0.20_160)]" />
					<h2 className="text-lg font-semibold text-foreground">v0.1.0</h2>
					<span className="text-sm text-muted-foreground">Alpha</span>
				</div>
				<div className="space-y-4">
					<ReleaseItem
						title="Core Foundation"
						items={[
							"Initial project architecture with Next.js 15",
							"PostgreSQL database with Prisma ORM",
							"Basic size chart data model",
							"Category and subcategory hierarchy",
						]}
					/>
					<ReleaseItem
						title="Admin Interface"
						items={[
							"Dashboard with chart management",
							"Visual chart editor with drag-and-drop rows",
							"Dual unit display (inches/cm)",
						]}
					/>
				</div>
			</section>

			{/* In Progress */}
			<section className="mb-8">
				<div className="flex items-center gap-2 mb-4">
					<Clock className="h-5 w-5 text-primary" />
					<h2 className="text-lg font-semibold text-foreground">v1.0</h2>
					<span className="text-sm text-muted-foreground">In Progress</span>
				</div>
				<div className="space-y-4">
					<ReleaseItem
						title="Integration"
						items={[
							"Zero-dependency embeddable widget",
							"JSON import/export for bulk management",
						]}
					/>
					<ReleaseItem
						title="Productivity"
						items={[
							"Pre-built chart templates for common use cases",
							"Version history with restore capability",
						]}
					/>
				</div>
			</section>

			{/* Considering */}
			<section>
				<div className="flex items-center gap-2 mb-4">
					<HelpCircle className="h-5 w-5 text-muted-foreground" />
					<h2 className="text-lg font-semibold text-foreground">Considering</h2>
				</div>
				<ul className="pl-6 text-sm text-muted-foreground space-y-1">
					<li>Webhooks for chart updates</li>
					<li>Redis caching for high-performance API</li>
					<li>Fit recommendation API</li>
					<li>Multi-tenancy support</li>
					<li>Analytics dashboard</li>
					<li>Full i18n support</li>
					<li>Shopify, WooCommerce, Magento integrations</li>
				</ul>
			</section>
		</div>
	);
}
