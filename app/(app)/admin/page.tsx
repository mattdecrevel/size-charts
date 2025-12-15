import Link from "next/link";
import { db } from "@/lib/db";
import {
	TableProperties,
	FolderTree,
	Plus,
	TrendingUp,
	ChevronRight,
	Clock,
	Code2,
	Wand2,
	ExternalLink,
	Play,
	LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
	const [sizeChartCount, categoryCount, publishedCount] = await Promise.all([
		db.sizeChart.count(),
		db.category.count(),
		db.sizeChart.count({ where: { isPublished: true } }),
	]);

	const recentCharts = await db.sizeChart.findMany({
		take: 5,
		orderBy: { updatedAt: "desc" },
		include: {
			subcategories: {
				include: {
					subcategory: {
						include: { category: true },
					},
				},
			},
		},
	});

	const stats = [
		{
			label: "Total Charts",
			value: sizeChartCount,
			icon: TableProperties,
			color: "oklch(0.55 0.28 295)", // Purple
		},
		{
			label: "Published",
			value: publishedCount,
			icon: TrendingUp,
			color: "oklch(0.65 0.20 160)", // Teal
		},
		{
			label: "Categories",
			value: categoryCount,
			icon: FolderTree,
			color: "oklch(0.65 0.28 330)", // Magenta
		},
	];

	const quickActions = [
		{ href: "/admin/templates", label: "Templates", icon: LayoutTemplate },
		{ href: "/admin/docs/embed", label: "Embed Guide", icon: Code2 },
		{ href: "/examples/live", label: "Live Builder", icon: Wand2 },
		{ href: "/examples/embed", label: "Widget Examples", icon: Play },
		{ href: "/size-guide", label: "Size Guide", icon: ExternalLink },
	];

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
						Dashboard
					</h1>
					<p className="text-muted-foreground mt-1">
						Manage your size charts and categories
					</p>
				</div>
				<Button asChild className="self-start">
					<Link href="/admin/size-charts/new">
						<Plus className="h-4 w-4" />
						New Size Chart
					</Link>
				</Button>
			</div>

			{/* Stats */}
			<div className="grid gap-5 sm:grid-cols-3">
				{stats.map((stat) => (
					<div
						key={stat.label}
						className="relative rounded-xl border border-border bg-card p-6 overflow-hidden"
					>
						{/* Colored top accent */}
						<div
							className="absolute top-0 left-0 right-0 h-1"
							style={{ backgroundColor: stat.color }}
						/>
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
								<p className="text-3xl font-bold text-foreground tracking-tight">
									{stat.value}
								</p>
							</div>
							<div
								className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
							>
								<stat.icon
									className="h-5 w-5"
									style={{ color: stat.color }}
								/>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Recently Updated */}
			<div className="rounded-xl border border-border bg-card overflow-hidden">
				<div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<h2 className="text-lg font-semibold text-foreground">
							Recently Updated
						</h2>
					</div>
					<Link
						href="/admin/size-charts"
						className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
					>
						View all
						<ChevronRight className="h-4 w-4" />
					</Link>
				</div>

				{recentCharts.length === 0 ? (
					<div className="px-6 py-14 text-center">
						<TableProperties className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
						<p className="text-muted-foreground mb-2">No size charts yet</p>
						<Link
							href="/admin/size-charts/new"
							className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
						>
							Create your first one
						</Link>
					</div>
				) : (
					<div className="divide-y divide-border">
						{recentCharts.map((chart) => (
							<Link
								key={chart.id}
								href={`/admin/size-charts/${chart.id}`}
								className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group"
							>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
										{chart.name}
									</p>
									<p className="text-sm text-muted-foreground truncate mt-0.5">
										{chart.subcategories.length > 0
											? `${chart.subcategories[0].subcategory.category.name} → ${chart.subcategories[0].subcategory.name}${chart.subcategories.length > 1 ? ` +${chart.subcategories.length - 1} more` : ""}`
											: "No category assigned"}
									</p>
								</div>
								<div className="flex items-center gap-4 ml-4 flex-shrink-0">
									<Badge variant={chart.isPublished ? "default" : "secondary"}>
										{chart.isPublished ? "Published" : "Draft"}
									</Badge>
									<span className="text-sm text-muted-foreground hidden sm:block">
										{new Date(chart.updatedAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})}
									</span>
									<ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
								</div>
							</Link>
						))}
					</div>
				)}
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				{quickActions.map((action) => (
					<Link
						key={action.href}
						href={action.href}
						className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-border transition-colors group"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
							<action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
						</div>
						<span className="text-sm font-medium text-foreground">{action.label}</span>
						<ChevronRight className="h-4 w-4 text-muted-foreground/40 ml-auto group-hover:text-muted-foreground transition-colors" />
					</Link>
				))}
			</div>
		</div>
	);
}
