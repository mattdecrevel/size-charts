import type { Metadata } from "next";
import { db } from "@/lib/db";

interface LayoutProps {
	children: React.ReactNode;
	params: Promise<{ category: string; subcategory: string; chart: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
	const { category: categorySlug, subcategory: subcategorySlug, chart: chartSlug } = await params;

	const chart = await db.sizeChart.findFirst({
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
			subcategories: {
				take: 1,
				include: {
					subcategory: {
						include: { category: { select: { name: true } } },
					},
				},
			},
		},
	});

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

export default function ChartLayout({ children }: LayoutProps) {
	return children;
}
