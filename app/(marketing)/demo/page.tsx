import Link from "next/link";
import { Code2, Wand2, ExternalLink, ArrowRight, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";

const demos = [
	{
		href: "/demo/embed",
		icon: Code2,
		title: "Embed Widget Examples",
		description: "Pre-configured widget examples showing light/dark themes, units, and compact mode.",
		external: false,
	},
	{
		href: "/demo/live",
		icon: Wand2,
		title: "Live Builder",
		description: "Interactive builder to configure and preview the widget with your settings.",
		external: false,
	},
	{
		href: "/demo/example.html",
		icon: ExternalLink,
		title: "Standalone HTML",
		description: "Plain HTML page demonstrating the embed widget - opens in new tab.",
		external: true,
	},
];

export default async function DemoPage() {
	// Fetch categories with chart counts for size guide section
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

	const categoriesWithCounts = categories.map((category) => ({
		...category,
		subcategories: category.subcategories.map((sub) => ({
			...sub,
			chartCount: countMap.get(sub.id) || 0,
		})),
		totalCharts: category.subcategories.reduce(
			(sum, sub) => sum + (countMap.get(sub.id) || 0),
			0
		),
	}));

	return (
		<div className="mx-auto">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Demo</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Explore different ways to use the size chart widget.
				</p>
			</div>

			{/* Demo Links */}
			<div className="grid gap-4 md:grid-cols-3">
				{demos.map((demo) =>
					demo.external ? (
						<a
							key={demo.href}
							href={demo.href}
							target="_blank"
							rel="noopener noreferrer"
							className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
						>
							<demo.icon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 mb-4" />
							<h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
								{demo.title}
							</h2>
							<p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
								{demo.description}
							</p>
							<span className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:gap-2 transition-all">
								Open
								<ExternalLink className="h-4 w-4" />
							</span>
						</a>
					) : (
						<Link
							key={demo.href}
							href={demo.href}
							className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
						>
							<demo.icon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 mb-4" />
							<h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
								{demo.title}
							</h2>
							<p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
								{demo.description}
							</p>
							<span className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:gap-2 transition-all">
								View
								<ArrowRight className="h-4 w-4" />
							</span>
						</Link>
					)
				)}
			</div>

			{/* Size Guide Section */}
			<div className="mt-12">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Size Guide</h2>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Browse size charts by category
						</p>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{categoriesWithCounts.map((category) => (
						<div
							key={category.id}
							className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
						>
							<div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
										{category.name}
									</h3>
									<span className="text-xs text-zinc-500">
										{category.totalCharts} {category.totalCharts === 1 ? "chart" : "charts"}
									</span>
								</div>
							</div>

							<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
								{category.subcategories
									.filter((sub) => sub.chartCount > 0)
									.slice(0, 5)
									.map((subcategory) => (
										<Link
											key={subcategory.id}
											href={`/size-guide/${category.slug}/${subcategory.slug}`}
											className="flex items-center justify-between px-5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-sm"
										>
											<span className="text-zinc-700 dark:text-zinc-300">
												{subcategory.name}
											</span>
											<ChevronRight className="h-4 w-4 text-zinc-400" />
										</Link>
									))}

								{category.subcategories.filter((sub) => sub.chartCount > 0).length > 5 && (
									<Link
										href={`/size-guide/${category.slug}`}
										className="block px-5 py-2.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
									>
										+{category.subcategories.filter((sub) => sub.chartCount > 0).length - 5} more
									</Link>
								)}

								{category.subcategories.filter((sub) => sub.chartCount > 0).length === 0 && (
									<div className="px-5 py-3 text-sm text-zinc-500 italic">
										No charts yet
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				<p className="mt-4 text-xs text-zinc-500">
					All measurements available in inches and centimeters. Use the unit toggle on any chart to switch.
				</p>
			</div>

			{/* Quick Embed */}
			<div className="mt-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
				<h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Quick Embed</h2>
				<p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
					Add size charts to any website with just two lines of code:
				</p>
				<pre className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100 overflow-x-auto">
					<code>{`<div data-chart="mens-tops"></div>
<script src="https://your-domain.com/embed/size-charts.js" data-api="https://your-domain.com"></script>`}</code>
				</pre>
			</div>
		</div>
	);
}
