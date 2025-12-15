import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronRight } from "lucide-react";

interface PageProps {
	params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { category: categorySlug } = await params;
	const category = await db.category.findUnique({
		where: { slug: categorySlug },
		select: { name: true },
	});

	if (!category) {
		return { title: "Category Not Found" };
	}

	return {
		title: `${category.name} Size Charts`,
		description: `Browse ${category.name.toLowerCase()} size charts. Find sizing guides for all ${category.name.toLowerCase()} clothing, footwear, and accessories.`,
		openGraph: {
			title: `${category.name} Size Charts | Size Charts`,
			description: `Browse ${category.name.toLowerCase()} size charts and find the perfect fit.`,
		},
	};
}

export default async function CategoryPage({ params }: PageProps) {
	const { category: categorySlug } = await params;

	const category = await db.category.findUnique({
		where: { slug: categorySlug },
		include: {
			subcategories: {
				orderBy: { displayOrder: "asc" },
			},
		},
	});

	if (!category) {
		notFound();
	}

	// Get count of published size charts per subcategory via many-to-many
	const subcategoryCounts = await db.sizeChartSubcategory.groupBy({
		by: ["subcategoryId"],
		where: {
			subcategory: { categoryId: category.id },
			sizeChart: { isPublished: true },
		},
		_count: {
			sizeChartId: true,
		},
	});

	const countMap = new Map(
		subcategoryCounts.map((c) => [c.subcategoryId, c._count.sizeChartId])
	);

	// Add counts to subcategories
	const categoryWithCounts = {
		...category,
		subcategories: category.subcategories.map((sub) => ({
			...sub,
			_count: {
				sizeCharts: countMap.get(sub.id) || 0,
			},
		})),
	};

	return (
		<div>
			<nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
				<Link href="/size-guide" className="hover:text-foreground transition-colors">
					Size Guide
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">{categoryWithCounts.name}</span>
			</nav>

			<h1 className="mb-8 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
				{categoryWithCounts.name} Size Charts
			</h1>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{categoryWithCounts.subcategories
					.filter((sub) => sub._count.sizeCharts > 0)
					.map((subcategory) => (
						<Link
							key={subcategory.id}
							href={`/size-guide/${categoryWithCounts.slug}/${subcategory.slug}`}
							className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:bg-primary/5 transition-colors"
						>
							<h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
								{subcategory.name}
							</h2>
							<p className="text-sm text-muted-foreground">
								{subcategory._count.sizeCharts} size chart{subcategory._count.sizeCharts !== 1 ? "s" : ""}
							</p>
						</Link>
					))}
			</div>

			{categoryWithCounts.subcategories.filter((sub) => sub._count.sizeCharts > 0).length === 0 && (
				<p className="text-center text-muted-foreground">No size charts available for this category yet.</p>
			)}
		</div>
	);
}
