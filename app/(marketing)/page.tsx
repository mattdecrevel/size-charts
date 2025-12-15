import Link from "next/link";
import {
	Code2,
	FileText,
	Layers,
	Globe,
	Key,
	Gauge,
	ArrowRight,
	ChevronRight,
	Ruler,
} from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "@/components/templates/template-preview";

const features = [
	{
		icon: Layers,
		title: "Hierarchical Categories",
		description: "Organize charts by category and subcategory. One chart can appear in multiple places.",
	},
	{
		icon: Globe,
		title: "Dual Unit System",
		description: "All measurements stored in inches, automatically converted to centimeters.",
	},
	{
		icon: Key,
		title: "API Authentication",
		description: "Secure API keys with scopes and rate limiting for production use.",
	},
	{
		icon: Code2,
		title: "Embeddable Widget",
		description: "Drop-in JavaScript widget that works on any website with zero dependencies.",
	},
	{
		icon: Gauge,
		title: "Rate Limited",
		description: "Built-in rate limiting protects your API from abuse (100 req/min).",
	},
	{
		icon: FileText,
		title: "Full REST API",
		description: "Complete CRUD operations for charts, categories, and labels.",
	},
];

const quickLinks = [
	{
		href: "/examples",
		icon: Code2,
		title: "Examples & Size Guide",
		description: "Widget examples, live builder, and browse all size charts by category.",
		cta: "View Examples",
	},
	{
		href: "/docs",
		icon: FileText,
		title: "Documentation",
		description: "Complete reference for integrating via REST API.",
		cta: "Read Docs",
	},
];

export default async function HomePage() {
	const categories = await db.category.findMany({
		orderBy: { displayOrder: "asc" },
		include: {
			subcategories: {
				orderBy: { displayOrder: "asc" },
			},
		},
	});

	const subcategoryCounts = await db.sizeChartSubcategory.groupBy({
		by: ["subcategoryId"],
		where: {
			sizeChart: { isPublished: true },
		},
		_count: {
			sizeChartId: true,
		},
	});

	const countMap = new Map(
		subcategoryCounts.map((c) => [c.subcategoryId, c._count.sizeChartId])
	);

	const categoriesWithCounts = categories
		.map((category) => ({
			...category,
			subcategories: category.subcategories
				.map((sub) => ({
					...sub,
					chartCount: countMap.get(sub.id) || 0,
				}))
				.filter((sub) => sub.chartCount > 0),
			totalCharts: category.subcategories.reduce(
				(sum, sub) => sum + (countMap.get(sub.id) || 0),
				0
			),
		}))
		.filter((cat) => cat.totalCharts > 0)
		.slice(0, 3);

	return (
		<div className="space-y-24">
			{/* Hero Section */}
			<section className="text-center pt-6 pb-8">
				<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-up">
					<Ruler className="h-4 w-4" />
					<span>E-commerce Size Management</span>
				</div>

				<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight animate-fade-up stagger-1">
					Size Charts{" "}
					<span className="text-gradient-warm">API</span>
				</h1>

				<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up stagger-2">
					A complete solution for managing and displaying e-commerce size charts.
					Use the API directly or embed the widget on any website.
				</p>

				<div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up stagger-3">
					<Button asChild>
						<Link href="/examples">
							<Code2 className="h-4 w-4" />
							View Examples
						</Link>
					</Button>
					<Button variant="secondary" asChild>
						<Link href="/docs">
							<FileText className="h-4 w-4" />
							Documentation
						</Link>
					</Button>
				</div>
			</section>

			{/* Features */}
			<section>
				<div className="flex items-center gap-4 mb-10">
					<h2 className="text-2xl font-semibold text-foreground">Features</h2>
					<div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
				</div>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, index) => (
						<div
							key={feature.title}
							className={`card-soft p-6 animate-fade-up stagger-${Math.min(index + 1, 6)}`}
						>
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-5">
								<feature.icon className="h-5 w-5 text-primary" />
							</div>
							<h3 className="text-base font-semibold text-foreground mb-2">
								{feature.title}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Templates Preview */}
			<TemplatePreview limit={4} />

			{/* Size Charts */}
			{categoriesWithCounts.length > 0 && (
				<section>
					<div className="flex items-center justify-between mb-10">
						<div className="flex items-center gap-4">
							<h2 className="text-2xl font-semibold text-foreground">Size Charts</h2>
							<div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-border to-transparent min-w-[40px]" />
						</div>
						<Link
							href="/size-guide"
							className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
						>
							Browse all <ChevronRight className="h-4 w-4" />
						</Link>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{categoriesWithCounts.map((category, index) => (
							<div
								key={category.id}
								className={`card-gradient animate-fade-up stagger-${Math.min(index + 1, 3)}`}
							>
								<div className="p-5">
									<div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
										<h3 className="text-lg font-semibold text-foreground">
											{category.name}
										</h3>
										<span className="badge badge-muted">
											{category.totalCharts} charts
										</span>
									</div>
									<div className="space-y-2">
										{category.subcategories.slice(0, 5).map((sub) => (
											<Link
												key={sub.id}
												href={`/size-guide/${category.slug}/${sub.slug}`}
												className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground group py-1.5 transition-colors"
											>
												<span className="truncate">{sub.name}</span>
												<ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
											</Link>
										))}
										{category.subcategories.length > 5 && (
											<Link
												href="/size-guide"
												className="block text-xs text-primary/70 hover:text-primary pt-2 transition-colors"
											>
												+{category.subcategories.length - 5} more
											</Link>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Get Started */}
			<section>
				<div className="flex items-center gap-4 mb-10">
					<h2 className="text-2xl font-semibold text-foreground">Get Started</h2>
					<div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					{quickLinks.map((link, index) => (
						<Link
							key={link.href}
							href={link.href}
							className={`group card-soft p-6 animate-fade-up stagger-${index + 1}`}
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 mb-5 transition-colors">
								<link.icon className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								{link.title}
							</h3>
							<p className="text-sm text-muted-foreground mb-5 leading-relaxed">
								{link.description}
							</p>
							<span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
								{link.cta}
								<ArrowRight className="h-4 w-4" />
							</span>
						</Link>
					))}
				</div>
			</section>

			{/* Quick Start Code */}
			<section>
				<div className="flex items-center gap-4 mb-10">
					<h2 className="text-2xl font-semibold text-foreground">Quick Start</h2>
					<div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
				</div>

				<div className="space-y-5">
					<div className="code-block">
						<div className="flex items-center justify-between border-b border-border px-4 py-3">
							<span className="text-sm font-medium text-muted-foreground">Embed with one line</span>
							<span className="text-xs text-muted-foreground/60 font-mono uppercase">HTML</span>
						</div>
						<pre>
							<code>{`<div data-chart="mens-tops"></div>
<script src="https://www.sizecharts.dev/embed/size-charts.js" data-api="https://www.sizecharts.dev"></script>`}</code>
						</pre>
					</div>

					<div className="code-block">
						<div className="flex items-center justify-between border-b border-border px-4 py-3">
							<span className="text-sm font-medium text-muted-foreground">Or fetch via API</span>
							<span className="text-xs text-muted-foreground/60 font-mono uppercase">cURL</span>
						</div>
						<pre>
							<code>{`curl -H "X-API-Key: sc_live_xxxx" \\
  "https://www.sizecharts.dev/api/v1/size-charts?slug=mens-tops"`}</code>
						</pre>
					</div>
				</div>
			</section>

			{/* Admin CTA */}
			<section className="text-center py-10 border-t border-border/50">
				<div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
					<Ruler className="h-4 w-4" />
					<span>Need to manage size charts?</span>
				</div>
				<div>
					<Link
						href="/admin"
						className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
					>
						Go to Admin Panel
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</section>
		</div>
	);
}
