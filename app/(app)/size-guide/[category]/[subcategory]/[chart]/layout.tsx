import type { Metadata } from "next";
import { db } from "@/lib/db";

interface LayoutProps {
	children: React.ReactNode;
	params: Promise<{ category: string; subcategory: string; chart: string }>;
}

async function getChartData(categorySlug: string, subcategorySlug: string, chartSlug: string) {
	return db.sizeChart.findFirst({
		where: {
			slug: chartSlug,
			isPublished: true,
			subcategories: {
				some: {
					subcategory: {
						slug: subcategorySlug,
						category: { slug: categorySlug },
					},
				},
			},
		},
		select: {
			name: true,
			description: true,
			updatedAt: true,
			subcategories: {
				take: 1,
				include: {
					subcategory: {
						include: { category: { select: { name: true, slug: true } } },
					},
				},
			},
		},
	});
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
	const { category: categorySlug, subcategory: subcategorySlug, chart: chartSlug } = await params;
	const chart = await getChartData(categorySlug, subcategorySlug, chartSlug);

	if (!chart) {
		return { title: "Size Chart Not Found" };
	}

	const categoryName = chart.subcategories[0]?.subcategory.category.name || "";
	const subcategoryName = chart.subcategories[0]?.subcategory.name || "";

	return {
		title: chart.name,
		description: chart.description || `${categoryName} ${subcategoryName.toLowerCase()} size chart with measurements in inches and centimeters.`,
		openGraph: {
			title: `${chart.name} | Size Charts`,
			description: chart.description || `${categoryName} ${subcategoryName.toLowerCase()} size chart.`,
		},
	};
}

export default async function ChartLayout({ children, params }: LayoutProps) {
	const { category: categorySlug, subcategory: subcategorySlug, chart: chartSlug } = await params;
	const chart = await getChartData(categorySlug, subcategorySlug, chartSlug);

	if (!chart) {
		return children;
	}

	const categoryName = chart.subcategories[0]?.subcategory.category.name || "";
	const subcategoryName = chart.subcategories[0]?.subcategory.name || "";
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.sizecharts.dev";

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: chart.name,
		description: chart.description || `${categoryName} ${subcategoryName.toLowerCase()} size chart`,
		url: `${baseUrl}/size-guide/${categorySlug}/${subcategorySlug}/${chartSlug}`,
		dateModified: chart.updatedAt.toISOString(),
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Size Guide",
					item: `${baseUrl}/size-guide`,
				},
				{
					"@type": "ListItem",
					position: 2,
					name: categoryName,
					item: `${baseUrl}/size-guide/${categorySlug}`,
				},
				{
					"@type": "ListItem",
					position: 3,
					name: subcategoryName,
					item: `${baseUrl}/size-guide/${categorySlug}/${subcategorySlug}`,
				},
				{
					"@type": "ListItem",
					position: 4,
					name: chart.name,
				},
			],
		},
		mainEntity: {
			"@type": "Table",
			about: `${categoryName} ${subcategoryName} sizing information`,
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			{children}
		</>
	);
}
