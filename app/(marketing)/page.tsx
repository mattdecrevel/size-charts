import Link from "next/link";
import {
	Code2,
	FileText,
	ArrowRight,
	ChevronRight,
	Ruler,
	Sparkles,
	Zap,
} from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "@/components/templates/template-preview";
import { SectionHeader } from "@/components/ui/section-header";
import { FeaturesGrid } from "@/components/ui/features-grid";

const features = [
	{
		iconName: "Layers",
		title: "Hierarchical Categories",
		description: "Organize charts by category and subcategory. One chart can appear in multiple places.",
	},
	{
		iconName: "Globe",
		title: "Dual Unit System",
		description: "All measurements stored in inches, automatically converted to centimeters.",
	},
	{
		iconName: "Key",
		title: "API Authentication",
		description: "Secure API keys with scopes and rate limiting for production use.",
	},
	{
		iconName: "Code2",
		title: "Embeddable Widget",
		description: "Drop-in JavaScript widget that works on any website with zero dependencies.",
	},
	{
		iconName: "Gauge",
		title: "Rate Limited",
		description: "Built-in rate limiting protects your API from abuse (100 req/min).",
	},
	{
		iconName: "FileText",
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
		<>
			{/* Hero Section - Full width, breaks out of container */}
			<section className="relative w-screen text-center -mt-20 sm:-mt-24 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-28 sm:pt-36 pb-24 overflow-hidden" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
				{/* Animated mesh gradient background */}
				<div className="absolute inset-0 hero-mesh pointer-events-none" />

				{/* Grid pattern with fade */}
				<div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial-faded pointer-events-none" />

				{/* Floating orbs */}
				<div className="orb orb-primary w-72 h-72 -top-20 -left-20 animate-aurora" />
				<div className="orb orb-accent w-96 h-96 -top-32 right-0 animate-aurora" style={{ animationDelay: "5s" }} />
				<div className="orb orb-primary w-64 h-64 bottom-0 left-1/4 animate-aurora" style={{ animationDelay: "10s" }} />

				{/* Animated beam lines */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-[20%] left-0 right-0 h-px">
						<div className="h-full w-40 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-beam" />
					</div>
					<div className="absolute top-[80%] left-0 right-0 h-px">
						<div className="h-full w-32 bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-beam" style={{ animationDelay: "4s" }} />
					</div>
				</div>

				{/* Ruler tick marks - left side */}
				<div className="absolute left-6 sm:left-10 top-16 bottom-16 w-6 hidden lg:flex flex-col justify-between opacity-20">
					{Array.from({ length: 11 }).map((_, i) => (
						<div key={`left-${i}`} className="flex items-center gap-1.5">
							<div className={`h-px bg-foreground transition-all duration-300 ${i % 5 === 0 ? 'w-5' : 'w-2'}`} />
							{i % 5 === 0 && (
								<span className="text-[10px] font-mono text-muted-foreground">{i * 10}</span>
							)}
						</div>
					))}
				</div>

				{/* Ruler tick marks - right side */}
				<div className="absolute right-6 sm:right-10 top-16 bottom-16 w-6 hidden lg:flex flex-col justify-between opacity-20">
					{Array.from({ length: 11 }).map((_, i) => (
						<div key={`right-${i}`} className="flex items-center justify-end gap-1.5">
							{i % 5 === 0 && (
								<span className="text-[10px] font-mono text-muted-foreground">{i * 10}</span>
							)}
							<div className={`h-px bg-foreground ${i % 5 === 0 ? 'w-5' : 'w-2'}`} />
						</div>
					))}
				</div>

				{/* Content - contained */}
				<div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-up animate-glow-pulse backdrop-blur-sm">
						<Sparkles className="h-4 w-4" />
						<span>E-commerce Size Management</span>
						<Zap className="h-3 w-3" />
					</div>

					{/* Main heading with gradient text */}
					<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight animate-fade-up stagger-1">
						Size Charts{" "}
						<span className="text-gradient-animated">API</span>
					</h1>

					{/* Subheading */}
					<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up stagger-2">
						A complete solution for managing and displaying e-commerce size charts.
						Use the API directly or embed the widget on any website.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up stagger-3">
						<Button asChild size="lg" className="group relative overflow-hidden">
							<Link href="/examples">
								<span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
								<Code2 className="h-5 w-5 relative" />
								<span className="relative">View Examples</span>
							</Link>
						</Button>
						<Button variant="secondary" asChild size="lg" className="backdrop-blur-sm">
							<Link href="/docs">
								<FileText className="h-5 w-5" />
								Documentation
							</Link>
						</Button>
					</div>

					{/* Stats row */}
					<div className="flex flex-wrap items-center justify-center gap-8 mt-16 animate-fade-up stagger-4">
						<div className="text-center">
							<div className="text-3xl font-bold text-foreground">100+</div>
							<div className="text-sm text-muted-foreground">Size Charts</div>
						</div>
						<div className="w-px h-10 bg-border" />
						<div className="text-center">
							<div className="text-3xl font-bold text-foreground">REST</div>
							<div className="text-sm text-muted-foreground">API</div>
						</div>
						<div className="w-px h-10 bg-border" />
						<div className="text-center">
							<div className="text-3xl font-bold text-foreground">1 line</div>
							<div className="text-sm text-muted-foreground">To embed</div>
						</div>
					</div>
				</div>
			</section>

			{/* Rest of content */}
			<div className="space-y-28 pb-10">
				{/* Features - Using spotlight cards */}
				<section>
					<SectionHeader
						title="Features"
						variant="lamp"
						subtitle="Everything you need to manage size charts for your e-commerce platform"
					/>

					<FeaturesGrid features={features} variant="spotlight" />
				</section>

				{/* Templates Preview */}
				<TemplatePreview limit={6} />

				{/* Size Charts */}
				{categoriesWithCounts.length > 0 && (
					<section>
						<SectionHeader
							title="Size Charts"
							variant="gradient-line"
							action={
								<Link
									href="/size-guide"
									className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group"
								>
									Browse all
									<ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
								</Link>
							}
						/>

						<div className="grid gap-6 md:grid-cols-3">
							{categoriesWithCounts.map((category, index) => (
								<div
									key={category.id}
									className={`card-glow group animate-fade-up stagger-${Math.min(index + 1, 3)}`}
								>
									<div className="relative z-10 p-6">
										<div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
											<h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
												{category.name}
											</h3>
											<span className="badge badge-muted">
												{category.totalCharts} charts
											</span>
										</div>
										<div className="space-y-2">
											{category.subcategories.slice(0, 3).map((sub) => (
												<Link
													key={sub.id}
													href={`/size-guide/${category.slug}/${sub.slug}`}
													className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground group/link py-1.5 transition-colors"
												>
													<span className="truncate">{sub.name}</span>
													<ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all flex-shrink-0" />
												</Link>
											))}
											{category.subcategories.length > 3 && (
												<Link
													href={`/size-guide/${category.slug}`}
													className="block text-xs text-primary/70 hover:text-primary pt-2 transition-colors"
												>
													+{category.subcategories.length - 3} more
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
					<SectionHeader
						title="Get Started"
						variant="gradient-line"
						subtitle="Start integrating size charts in minutes"
					/>

					<div className="grid gap-6 md:grid-cols-2">
						{quickLinks.map((link, index) => (
							<Link
								key={link.href}
								href={link.href}
								className={`group card-glow p-6 animate-fade-up stagger-${index + 1}`}
							>
								<div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 mb-5 transition-colors overflow-hidden">
									<link.icon className="h-6 w-6 text-primary relative z-10 group-hover:scale-110 transition-transform" />
									<div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
								<h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
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

				{/* Admin CTA */}
				<section className="relative text-center py-6 overflow-hidden">
					{/* Background effect
					<div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
					<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" /> */}

					<div className="relative">
						<div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
							<Ruler className="h-4 w-4" />
							<span>Need to manage size charts?</span>
						</div>
						<div>
							<Link
								href="/admin"
								className="inline-flex items-center gap-2 text-base font-medium text-primary hover:text-primary/80 transition-colors group underline-grow"
							>
								Go to Admin Panel
								<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Link>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}
